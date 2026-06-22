<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Company_Brief {

	public function __construct() {
		add_shortcode( 'jais_company_brief', [ $this, 'render' ] );
		add_action( 'wp_ajax_jais_company_brief',        [ $this, 'ajax_handler' ] );
		add_action( 'wp_ajax_nopriv_jais_company_brief', [ $this, 'ajax_handler' ] );
	}

	public function render( $atts ): string {
		$gate = JAIS_Core::check_access( 'company_brief' );
		if ( true !== $gate ) return (string) $gate;

		ob_start();
		?>
		<div class="jais-card" id="jais-company-brief">
			<div class="jais-card__header">
				<span class="jais-icon">🏢</span>
				<div>
					<h2 class="jais-card__title">Company Briefing</h2>
					<p class="jais-card__subtitle">Pre-interview intel — culture, tech stack, interview tips</p>
				</div>
			</div>

			<form class="jais-form" data-action="jais_company_brief">
				<div class="jais-field">
					<label class="jais-label" for="jais-cb-company">Company Name <span class="jais-req">*</span></label>
					<input class="jais-input" id="jais-cb-company" name="company" type="text" placeholder="e.g. Nuffield Health, Spire Healthcare…" required>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-cb-title">Your Job Title <span class="jais-req">*</span></label>
					<input class="jais-input" id="jais-cb-title" name="job_title" type="text" placeholder="e.g. Physiotherapist" required>
				</div>

				<div class="jais-field">
					<label class="jais-label" for="jais-cb-desc">Job Description</label>
					<textarea class="jais-textarea" id="jais-cb-desc" name="job_description" rows="4" placeholder="Paste the job description for more tailored insights…"></textarea>
				</div>

				<button class="jais-btn jais-btn--green" type="submit">
					<span class="jais-btn__text">Generate Briefing</span>
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

		$company         = sanitize_text_field( wp_unslash( $_POST['company']          ?? '' ) );
		$job_title       = sanitize_text_field( wp_unslash( $_POST['job_title']        ?? '' ) );
		$job_description = sanitize_textarea_field( wp_unslash( $_POST['job_description'] ?? '' ) );

		if ( empty( $company ) || empty( $job_title ) ) {
			wp_send_json_error( 'Company name and job title are required.' );
		}

		// Exact prompt ported from app/api/company-briefing/route.ts + UK healthcare context.
		$prompt = "You are a research analyst preparing a pre-interview briefing for a UK private healthcare job seeker.
Always reference CQC registration requirements, UK GBP salaries, and NHS vs private sector differences where relevant.

Generate a realistic and insightful company briefing for:

**COMPANY:** {$company}
**ROLE:** {$job_title}
**JOB DESCRIPTION:** {$job_description}

Base your response on general knowledge about this type of company and role in UK private healthcare. Be specific and useful.

Return ONLY valid JSON:
{
  \"overview\": \"2-3 sentence company overview — what they do, size, CQC status, private vs NHS\",
  \"recentNews\": [\"relevant news item or trend about this company or the UK private healthcare sector\"],
  \"techStack\": [\"likely systems and technologies used based on the role and company type e.g. EPR systems, clinical software\"],
  \"cultureInsights\": [\"insight about working culture based on available signals\"],
  \"glassdoorSentiment\": \"Typical employee sentiment summary for this type of UK private healthcare employer\",
  \"interviewTips\": [\"specific tip for interviewing at this company for this role in UK private healthcare\"],
  \"keyPeople\": [\"type of people likely on the interview panel e.g. 'Clinical Director', 'Registered Manager (CQC)'\"],
  \"verdict\": \"One sentence: what makes this employer stand out in UK private healthcare\"
}

Return ONLY JSON.";

		$api      = new JAIS_API();
		$response = $api->call( $prompt, 1024, 'company_brief' );

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
