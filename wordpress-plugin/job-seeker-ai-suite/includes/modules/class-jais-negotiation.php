<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Negotiation {

	public function __construct() {
		add_shortcode( 'jais_negotiation', [ $this, 'render' ] );
		add_action( 'wp_ajax_jais_negotiation',        [ $this, 'ajax_handler' ] );
		add_action( 'wp_ajax_nopriv_jais_negotiation', [ $this, 'ajax_handler' ] );
	}

	public function render( $atts ): string {
		$gate = JAIS_Core::check_access( 'negotiation' );
		if ( true !== $gate ) return (string) $gate;

		ob_start();
		?>
		<div class="jais-card" id="jais-negotiation">
			<div class="jais-card__header">
				<span class="jais-icon">💰</span>
				<div>
					<h2 class="jais-card__title">Salary Negotiation Coach</h2>
					<p class="jais-card__subtitle">Market rates, counter-offer strategy, and a ready-to-send email</p>
				</div>
			</div>

			<form class="jais-form" data-action="jais_negotiation">
				<div class="jais-field">
					<label class="jais-label" for="jais-neg-title">Job Title <span class="jais-req">*</span></label>
					<input class="jais-input" id="jais-neg-title" name="job_title" type="text" placeholder="e.g. Registered Nurse — Private Hospital" required>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-neg-location">Location <span class="jais-req">*</span></label>
					<input class="jais-input" id="jais-neg-location" name="location" type="text" placeholder="e.g. London, Manchester, Birmingham…" required>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-neg-offer">Salary Offered (£) <span class="jais-req">*</span></label>
					<input class="jais-input" id="jais-neg-offer" name="offered_salary" type="text" placeholder="e.g. £38,000" required>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-neg-exp">Years of Experience <span class="jais-req">*</span></label>
					<input class="jais-input" id="jais-neg-exp" name="years_experience" type="number" min="0" max="50" placeholder="e.g. 5" required>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-neg-skills">Your Key Skills</label>
					<input class="jais-input" id="jais-neg-skills" name="skills" type="text" placeholder="e.g. CQC compliance, Team leadership, Specialist clinical skills…">
				</div>

				<button class="jais-btn jais-btn--green" type="submit">
					<span class="jais-btn__text">Get Negotiation Strategy</span>
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

		$job_title       = sanitize_text_field( wp_unslash( $_POST['job_title']        ?? '' ) );
		$location        = sanitize_text_field( wp_unslash( $_POST['location']          ?? '' ) );
		$offered_salary  = sanitize_text_field( wp_unslash( $_POST['offered_salary']    ?? '' ) );
		$years_experience= absint( $_POST['years_experience'] ?? 0 );
		$skills          = sanitize_text_field( wp_unslash( $_POST['skills']            ?? '' ) );

		if ( empty( $job_title ) || empty( $location ) || empty( $offered_salary ) ) {
			wp_send_json_error( 'Job title, location and salary offer are required.' );
		}

		// Exact prompt ported from app/api/negotiation/route.ts + UK healthcare context.
		$prompt = "You are a salary negotiation expert helping a UK private healthcare job seeker negotiate their offer.
Always reference CQC registration requirements, UK GBP salaries, and NHS vs private sector differences where relevant.
All salary figures must be in GBP (£).

**ROLE:** {$job_title}
**LOCATION:** {$location}
**OFFER RECEIVED:** {$offered_salary}
**YEARS EXPERIENCE:** {$years_experience}
**KEY SKILLS:** {$skills}

Provide negotiation advice with UK private healthcare market data context.

Return ONLY valid JSON:
{
  \"marketMin\": \"£35,000\",
  \"marketMax\": \"£55,000\",
  \"marketMid\": \"£43,000\",
  \"counterOffer\": \"£47,000\",
  \"emailScript\": \"Full email they can send to negotiate — professional but confident tone, referencing UK private healthcare market rates\",
  \"tactics\": [\"specific negotiation tactic relevant to UK private healthcare\"],
  \"leverage\": [\"leverage point the seeker has, e.g. CQC experience, specialist skills, private sector scarcity\"]
}

Be realistic with UK private healthcare market data. Return ONLY JSON.";

		$api      = new JAIS_API();
		$response = $api->call( $prompt, 1024, 'negotiation' );

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
