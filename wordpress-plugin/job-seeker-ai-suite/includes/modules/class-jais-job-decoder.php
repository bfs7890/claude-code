<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Job_Decoder {

	public function __construct() {
		add_shortcode( 'jais_job_decoder', [ $this, 'render' ] );
		add_action( 'wp_ajax_jais_job_decoder',        [ $this, 'ajax_handler' ] );
		add_action( 'wp_ajax_nopriv_jais_job_decoder', [ $this, 'ajax_handler' ] );
	}

	public function render( $atts ): string {
		$gate = JAIS_Core::check_access( 'job_decoder' );
		if ( true !== $gate ) return (string) $gate;

		ob_start();
		?>
		<div class="jais-card" id="jais-job-decoder">
			<div class="jais-card__header">
				<span class="jais-icon">🔍</span>
				<div>
					<h2 class="jais-card__title">Job Description Decoder</h2>
					<p class="jais-card__subtitle">Uncover red flags, culture signals and what the job really requires</p>
				</div>
			</div>

			<form class="jais-form" data-action="jais_job_decoder">
				<div class="jais-field">
					<label class="jais-label" for="jais-jd-title">Job Title <span class="jais-req">*</span></label>
					<input class="jais-input" id="jais-jd-title" name="job_title" type="text" placeholder="e.g. Ward Manager — Private Hospital" required>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-jd-desc">Job Description <span class="jais-req">*</span></label>
					<textarea class="jais-textarea" id="jais-jd-desc" name="job_description" rows="6" placeholder="Paste the full job description…" required></textarea>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-jd-reqs">Requirements</label>
					<textarea class="jais-textarea" id="jais-jd-reqs" name="requirements" rows="3" placeholder="Paste any listed requirements…"></textarea>
				</div>

				<button class="jais-btn jais-btn--blue" type="submit">
					<span class="jais-btn__text">Decode This Job</span>
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
		$requirements    = sanitize_textarea_field( wp_unslash( $_POST['requirements']    ?? '' ) );

		if ( empty( $job_title ) || empty( $job_description ) ) {
			wp_send_json_error( 'Job title and description are required.' );
		}

		// Exact prompt ported from app/api/decode-job/route.ts + UK healthcare context.
		$prompt = "You are a brutally honest career advisor who decodes job postings for UK private healthcare job seekers.
Always reference CQC registration requirements, UK GBP salaries, and NHS vs private sector differences where relevant.

Analyse this job posting and reveal the truth behind the language used.

**JOB TITLE:** {$job_title}
**DESCRIPTION:** {$job_description}
**REQUIREMENTS:** {$requirements}

Return ONLY valid JSON:
{
  \"plainSummary\": \"In plain English, what this job actually is (2-3 sentences)\",
  \"redFlags\": [\"warning signal found in the posting\"],
  \"greenFlags\": [\"positive signal found in the posting\"],
  \"cultureSignals\": [\"what the language reveals about company culture\"],
  \"realRequirements\": [\"skills you MUST have to get hired\"],
  \"niceToHave\": [\"skills listed but probably not dealbreakers\"],
  \"overallRating\": 82,
  \"verdict\": \"One punchy sentence: is this worth applying to and why\"
}

overallRating is 0-100. Be honest about red flags. Return ONLY JSON.";

		$api      = new JAIS_API();
		$response = $api->call( $prompt, 1024, 'job_decoder' );

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
