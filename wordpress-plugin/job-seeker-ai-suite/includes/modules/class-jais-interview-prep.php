<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Interview_Prep {

	public function __construct() {
		add_shortcode( 'jais_interview_prep', [ $this, 'render' ] );
		add_action( 'wp_ajax_jais_interview_prep',        [ $this, 'ajax_handler' ] );
		add_action( 'wp_ajax_nopriv_jais_interview_prep', [ $this, 'ajax_handler' ] );
	}

	public function render( $atts ): string {
		$gate = JAIS_Core::check_access( 'interview_prep' );
		if ( true !== $gate ) return (string) $gate;

		ob_start();
		?>
		<div class="jais-card" id="jais-interview-prep">
			<div class="jais-card__header">
				<span class="jais-icon">💬</span>
				<div>
					<h2 class="jais-card__title">Interview Prep Coach</h2>
					<p class="jais-card__subtitle">6 tailored interview questions with model answers</p>
				</div>
			</div>

			<form class="jais-form" data-action="jais_interview_prep">
				<div class="jais-field">
					<label class="jais-label" for="jais-ip-title">Job Title <span class="jais-req">*</span></label>
					<input class="jais-input" id="jais-ip-title" name="job_title" type="text" placeholder="e.g. Senior Care Coordinator — Private Clinic" required>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-ip-desc">Job Description <span class="jais-req">*</span></label>
					<textarea class="jais-textarea" id="jais-ip-desc" name="job_description" rows="4" placeholder="Paste the job description…" required></textarea>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-ip-reqs">Key Requirements</label>
					<textarea class="jais-textarea" id="jais-ip-reqs" name="requirements" rows="3" placeholder="List key requirements…"></textarea>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-ip-bg">Your Background <span class="jais-req">*</span></label>
					<textarea class="jais-textarea" id="jais-ip-bg" name="seeker_background" rows="3" placeholder="Briefly describe your experience and background…" required></textarea>
				</div>

				<button class="jais-btn jais-btn--pink" type="submit">
					<span class="jais-btn__text">Generate Interview Questions</span>
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

		$job_title        = sanitize_text_field( wp_unslash( $_POST['job_title']         ?? '' ) );
		$job_description  = sanitize_textarea_field( wp_unslash( $_POST['job_description']  ?? '' ) );
		$requirements     = sanitize_textarea_field( wp_unslash( $_POST['requirements']     ?? '' ) );
		$seeker_background= sanitize_textarea_field( wp_unslash( $_POST['seeker_background'] ?? '' ) );

		if ( empty( $job_title ) || empty( $job_description ) || empty( $seeker_background ) ) {
			wp_send_json_error( 'Job title, description, and your background are required.' );
		}

		// Exact prompt ported from app/api/interview-prep/route.ts + UK healthcare context.
		$prompt = "You are an expert interview coach preparing a job seeker for a UK private healthcare interview.
Always reference CQC registration requirements, UK GBP salaries, and NHS vs private sector differences where relevant.

**ROLE:** {$job_title}
**JOB DESCRIPTION:** {$job_description}
**REQUIREMENTS:** {$requirements}
**SEEKER BACKGROUND:** {$seeker_background}

Generate 6 highly likely interview questions for this specific UK private healthcare role and provide tailored answers.

Return ONLY valid JSON array:
[
  {
    \"question\": \"Tell me about a time you led a clinical team through a CQC inspection\",
    \"category\": \"Behavioural\",
    \"suggestedAnswer\": \"Tailored answer based on the seeker's background (2-3 sentences, STAR format), referencing UK private healthcare context\",
    \"tip\": \"One specific delivery tip for this question in a UK private healthcare interview\"
  }
]

Categories: Technical, Behavioural, Situational, Culture Fit, Leadership, Role-specific.
Mix categories. Return ONLY the JSON array.";

		$api      = new JAIS_API();
		$response = $api->call( $prompt, 2048, 'interview_prep' );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( $response->get_error_message() );
		}

		$data = JAIS_API::parse_json( $response );
		if ( ! is_array( $data ) || empty( $data ) ) {
			wp_send_json_error( 'Could not parse AI response. Please try again.' );
		}

		wp_send_json_success( $data );
	}
}
