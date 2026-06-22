<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Skills_Gap {

	public function __construct() {
		add_shortcode( 'jais_skills_gap', [ $this, 'render' ] );
		add_action( 'wp_ajax_jais_skills_gap',        [ $this, 'ajax_handler' ] );
		add_action( 'wp_ajax_nopriv_jais_skills_gap', [ $this, 'ajax_handler' ] );
	}

	public function render( $atts ): string {
		$gate = JAIS_Core::check_access( 'skills_gap' );
		if ( true !== $gate ) return (string) $gate;

		ob_start();
		?>
		<div class="jais-card" id="jais-skills-gap">
			<div class="jais-card__header">
				<span class="jais-icon">⚡</span>
				<div>
					<h2 class="jais-card__title">Skills Gap Analyser</h2>
					<p class="jais-card__subtitle">See exactly what skills you need and get a learning path</p>
				</div>
			</div>

			<form class="jais-form" data-action="jais_skills_gap">
				<div class="jais-field">
					<label class="jais-label" for="jais-sg-title">Job Title <span class="jais-req">*</span></label>
					<input class="jais-input" id="jais-sg-title" name="job_title" type="text" placeholder="e.g. Healthcare Assistant — Private Clinic" required>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-sg-reqs">Job Requirements <span class="jais-req">*</span></label>
					<textarea class="jais-textarea" id="jais-sg-reqs" name="job_requirements" rows="4" placeholder="Paste requirements, one per line or comma-separated…" required></textarea>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-sg-skills">Your Current Skills <span class="jais-req">*</span></label>
					<textarea class="jais-textarea" id="jais-sg-skills" name="seeker_skills" rows="3" placeholder="List your skills, comma-separated…" required></textarea>
				</div>

				<button class="jais-btn jais-btn--yellow" type="submit">
					<span class="jais-btn__text">Analyse My Skills Gap</span>
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

		$job_title        = sanitize_text_field( wp_unslash( $_POST['job_title']        ?? '' ) );
		$job_requirements = sanitize_textarea_field( wp_unslash( $_POST['job_requirements'] ?? '' ) );
		$seeker_skills    = sanitize_textarea_field( wp_unslash( $_POST['seeker_skills']    ?? '' ) );

		if ( empty( $job_title ) || empty( $job_requirements ) || empty( $seeker_skills ) ) {
			wp_send_json_error( 'Required fields are missing.' );
		}

		// Exact prompt ported from app/api/skills-gap/route.ts + UK healthcare context.
		$prompt = "You are a career development expert and skills analyst specialising in UK private healthcare.
Always reference CQC registration requirements, UK GBP salaries, and NHS vs private sector differences where relevant.

Analyse the gap between a job seeker's current skills and a job's requirements.

**JOB TITLE:** {$job_title}

**JOB REQUIREMENTS:**
{$job_requirements}

**SEEKER'S CURRENT SKILLS:**
{$seeker_skills}

Return ONLY valid JSON matching this structure:
{
  \"presentSkills\": [\"skill1\"],
  \"missingSkills\": [\"skill1\"],
  \"gapScore\": 78,
  \"summary\": \"You have 78% of the required skills. 3 key skills missing.\",
  \"learningPath\": [
    { \"skill\": \"CQC Compliance\", \"resource\": \"CQC provider handbook + Skills for Care e-learning\", \"duration\": \"2 weeks\" }
  ]
}

gapScore is 0-100 (100 = perfect match). learningPath only for missingSkills. Return ONLY JSON.";

		$api      = new JAIS_API();
		$response = $api->call( $prompt, 1024, 'skills_gap' );

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
