<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_CV_Tailor {

	public function __construct() {
		add_shortcode( 'jais_cv_tailor', [ $this, 'render' ] );
		add_action( 'wp_ajax_jais_cv_tailor',        [ $this, 'ajax_handler' ] );
		add_action( 'wp_ajax_nopriv_jais_cv_tailor', [ $this, 'ajax_handler' ] );
	}

	public function render( $atts ): string {
		$gate = JAIS_Core::check_access( 'cv_tailor' );
		if ( true !== $gate ) return (string) $gate;

		ob_start();
		?>
		<div class="jais-card" id="jais-cv-tailor">
			<div class="jais-card__header">
				<span class="jais-icon">✨</span>
				<div>
					<h2 class="jais-card__title">AI CV Tailor</h2>
					<p class="jais-card__subtitle">Claude rewrites your CV to match any job description</p>
				</div>
			</div>

			<form class="jais-form" data-action="jais_cv_tailor">
				<div class="jais-field">
					<label class="jais-label" for="jais-cvt-title">Job Title <span class="jais-req">*</span></label>
					<input class="jais-input" id="jais-cvt-title" name="job_title" type="text" placeholder="e.g. Registered Nurse — Private Care Home" required>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-cvt-desc">Job Description <span class="jais-req">*</span></label>
					<textarea class="jais-textarea" id="jais-cvt-desc" name="job_description" rows="5" placeholder="Paste the full job description here…" required></textarea>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-cvt-reqs">Key Requirements <span class="jais-req">*</span></label>
					<textarea class="jais-textarea" id="jais-cvt-reqs" name="job_requirements" rows="3" placeholder="List each requirement on a new line…" required></textarea>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-cvt-summary">Your Current CV Summary <span class="jais-req">*</span></label>
					<textarea class="jais-textarea" id="jais-cvt-summary" name="cv_summary" rows="3" placeholder="Your current professional summary…" required></textarea>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-cvt-exp">Your Experience (one role per line: Company | Role | Dates | Key achievements)</label>
					<textarea class="jais-textarea" id="jais-cvt-exp" name="cv_experience" rows="4" placeholder="St Mary's Private Hospital | Senior RN | 2020–present | Led team of 8, CQC inspection lead…"></textarea>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-cvt-skills">Your Skills (comma-separated)</label>
					<input class="jais-input" id="jais-cvt-skills" name="cv_skills" type="text" placeholder="CQC compliance, Patient care, IV therapy, Team leadership…">
				</div>

				<button class="jais-btn" type="submit">
					<span class="jais-btn__text">Tailor My CV</span>
					<span class="jais-spinner" hidden></span>
				</button>
			</form>

			<div class="jais-result" hidden></div>
		</div>
		<?php
		return ob_get_clean();
	}

	public function ajax_handler() {
		check_ajax_referer( 'jais_nonce', 'nonce' );

		$job_title       = sanitize_text_field( wp_unslash( $_POST['job_title']       ?? '' ) );
		$job_description = sanitize_textarea_field( wp_unslash( $_POST['job_description'] ?? '' ) );
		$job_requirements= sanitize_textarea_field( wp_unslash( $_POST['job_requirements'] ?? '' ) );
		$cv_summary      = sanitize_textarea_field( wp_unslash( $_POST['cv_summary']   ?? '' ) );
		$cv_experience   = sanitize_textarea_field( wp_unslash( $_POST['cv_experience'] ?? '' ) );
		$cv_skills       = sanitize_text_field( wp_unslash( $_POST['cv_skills']       ?? '' ) );

		if ( empty( $job_title ) || empty( $job_description ) || empty( $job_requirements ) || empty( $cv_summary ) ) {
			wp_send_json_error( 'Required fields are missing.' );
		}

		// Exact prompt ported from app/api/tailor-cv/route.ts + UK healthcare context.
		$prompt = "You are an expert CV writer and career coach specialising in UK private healthcare recruitment.
Always reference CQC registration requirements, UK GBP salaries, and NHS vs private sector differences where relevant.

Given the job seeker's base CV and a specific job posting, rewrite and tailor the CV to maximise relevance and match score.

**JOB TITLE:** {$job_title}

**JOB DESCRIPTION:**
{$job_description}

**KEY REQUIREMENTS:**
{$job_requirements}

**BASE CV SUMMARY:**
{$cv_summary}

**BASE CV EXPERIENCE:**
{$cv_experience}

**BASE CV SKILLS:**
{$cv_skills}

Your task:
1. Rewrite the professional summary to speak directly to this role
2. Reorder and enhance experience bullet points to highlight relevant achievements
3. Add or reorder skills to match the job requirements
4. Quantify achievements where possible
5. Use keywords from the job description naturally
6. Reference CQC compliance, UK regulatory standards, and private healthcare context where appropriate

Return a JSON object with this exact structure:
{
  \"summary\": \"tailored summary text\",
  \"skills\": [\"skill1\", \"skill2\"],
  \"experience\": [
    {
      \"company\": \"...\",
      \"role\": \"...\",
      \"startDate\": \"...\",
      \"endDate\": \"...\",
      \"bullets\": [\"bullet1\", \"bullet2\"]
    }
  ],
  \"matchScore\": 85,
  \"keyChanges\": [\"change1\", \"change2\", \"change3\"],
  \"coverNote\": \"A 2-sentence personalised cover note for this application\"
}

Return ONLY valid JSON, no markdown fences.";

		$api      = new JAIS_API();
		$response = $api->call( $prompt, 2048, 'cv_tailor' );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( $response->get_error_message() );
		}

		$data = JAIS_API::parse_json( $response );
		if ( empty( $data ) ) {
			wp_send_json_error( 'Could not parse AI response. Please try again.' );
		}

		wp_send_json_success( $data );
	}
}
