<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Prioritiser {

	public function __construct() {
		add_shortcode( 'jais_prioritiser', [ $this, 'render' ] );
		add_action( 'wp_ajax_jais_prioritiser',        [ $this, 'ajax_handler' ] );
		add_action( 'wp_ajax_nopriv_jais_prioritiser', [ $this, 'ajax_handler' ] );
	}

	public function render( $atts ): string {
		$gate = JAIS_Core::check_access( 'prioritiser' );
		if ( true !== $gate ) return (string) $gate;

		ob_start();
		?>
		<div class="jais-card" id="jais-prioritiser">
			<div class="jais-card__header">
				<span class="jais-icon">📊</span>
				<div>
					<h2 class="jais-card__title">Smart Job Prioritiser</h2>
					<p class="jais-card__subtitle">Paste up to 5 job listings and AI ranks them by match quality</p>
				</div>
			</div>

			<form class="jais-form" data-action="jais_prioritiser">
				<?php for ( $i = 1; $i <= 5; $i++ ) : ?>
					<div class="jais-field">
						<label class="jais-label" for="jais-pri-job-<?php echo $i; ?>">
							Job Listing <?php echo $i; ?><?php echo $i === 1 ? ' <span class="jais-req">*</span>' : ' <span class="jais-optional">(optional)</span>'; ?>
						</label>
						<textarea
							class="jais-textarea"
							id="jais-pri-job-<?php echo $i; ?>"
							name="job_<?php echo $i; ?>"
							rows="4"
							<?php echo $i === 1 ? 'required' : ''; ?>
							placeholder="Paste job title, company, description and requirements for listing <?php echo $i; ?>…"
						></textarea>
					</div>
				<?php endfor; ?>

				<div class="jais-field">
					<label class="jais-label" for="jais-pri-profile">Your Profile / Skills</label>
					<textarea class="jais-textarea" id="jais-pri-profile" name="seeker_profile" rows="3" placeholder="Briefly describe your background, qualifications, and skills so AI can score match quality…"></textarea>
				</div>

				<button class="jais-btn" type="submit">
					<span class="jais-btn__text">Rank These Jobs</span>
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

		$jobs = [];
		for ( $i = 1; $i <= 5; $i++ ) {
			$job = sanitize_textarea_field( wp_unslash( $_POST[ "job_{$i}" ] ?? '' ) );
			if ( ! empty( $job ) ) {
				$jobs[] = "**JOB {$i}:**\n{$job}";
			}
		}
		$seeker_profile = sanitize_textarea_field( wp_unslash( $_POST['seeker_profile'] ?? '' ) );

		if ( empty( $jobs ) ) {
			wp_send_json_error( 'At least one job listing is required.' );
		}

		$jobs_text   = implode( "\n\n", $jobs );
		$job_count   = count( $jobs );

		$prompt = "You are a UK private healthcare career advisor helping a job seeker prioritise their applications.
Always reference CQC registration requirements, UK GBP salaries, and NHS vs private sector differences.

A job seeker has provided {$job_count} job listing(s) and their profile. Score each listing 0-100 for match quality and rank them highest first.

**SEEKER PROFILE:**
{$seeker_profile}

**JOB LISTINGS:**
{$jobs_text}

Return ONLY a valid JSON array, ranked highest score first:
[
  {
    \"jobIndex\": 1,
    \"jobTitle\": \"extracted job title or first line\",
    \"company\": \"extracted company name if present\",
    \"score\": 87,
    \"reason\": \"2-sentence reason for this score, referencing UK private healthcare fit\",
    \"greenFlags\": [\"positive signal in this listing relevant to UK private healthcare\"],
    \"redFlags\": [\"concern about this listing — CQC status, salary below market, unclear contract type etc\"],
    \"salaryNote\": \"comment on salary vs UK private healthcare market rates if salary is mentioned\"
  }
]

Return ONLY the JSON array, no markdown.";

		$api      = new JAIS_API();
		$response = $api->call( $prompt, 2048, 'prioritiser' );

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
