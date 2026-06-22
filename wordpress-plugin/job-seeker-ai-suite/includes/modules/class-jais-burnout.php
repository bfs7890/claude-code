<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Burnout {

	public function __construct() {
		add_shortcode( 'jais_burnout', [ $this, 'render' ] );
		add_action( 'wp_ajax_jais_burnout',        [ $this, 'ajax_handler' ] );
		add_action( 'wp_ajax_nopriv_jais_burnout', [ $this, 'ajax_handler' ] );
	}

	public function render( $atts ): string {
		$gate = JAIS_Core::check_access( 'burnout' );
		if ( true !== $gate ) return (string) $gate;

		$sliders = [
			'stress'     => [ 'label' => 'Stress Level',      'desc' => '1 = Very low, 5 = Overwhelming',  'icon' => '😰' ],
			'sleep'      => [ 'label' => 'Sleep Quality',     'desc' => '1 = Very poor, 5 = Excellent',     'icon' => '😴' ],
			'workload'   => [ 'label' => 'Workload',           'desc' => '1 = Very light, 5 = Unmanageable', 'icon' => '📋' ],
			'motivation' => [ 'label' => 'Motivation',         'desc' => '1 = Very low, 5 = High',           'icon' => '🔥' ],
			'balance'    => [ 'label' => 'Work-Life Balance',  'desc' => '1 = Very poor, 5 = Excellent',     'icon' => '⚖️' ],
		];

		ob_start();
		?>
		<div class="jais-card" id="jais-burnout">
			<div class="jais-card__header">
				<span class="jais-icon">❤️</span>
				<div>
					<h2 class="jais-card__title">Wellbeing & Burnout Tracker</h2>
					<p class="jais-card__subtitle">Rate your week and get personalised wellbeing advice</p>
				</div>
			</div>

			<form class="jais-form" data-action="jais_burnout">
				<?php foreach ( $sliders as $key => $slider ) : ?>
					<div class="jais-field jais-slider-field">
						<div class="jais-slider-header">
							<label class="jais-label" for="jais-bt-<?php echo esc_attr( $key ); ?>">
								<?php echo esc_html( $slider['icon'] ); ?> <?php echo esc_html( $slider['label'] ); ?>
							</label>
							<span class="jais-slider-value" id="jais-bt-<?php echo esc_attr( $key ); ?>-val">3</span>
						</div>
						<input
							class="jais-slider"
							id="jais-bt-<?php echo esc_attr( $key ); ?>"
							name="<?php echo esc_attr( $key ); ?>"
							type="range"
							min="1"
							max="5"
							value="3"
							step="1"
						>
						<div class="jais-slider-labels">
							<span><?php echo esc_html( explode( ',', $slider['desc'] )[0] ); ?></span>
							<span><?php echo esc_html( explode( ', ', $slider['desc'] )[1] ?? '' ); ?></span>
						</div>
					</div>
				<?php endforeach; ?>

				<button class="jais-btn jais-btn--pink" type="submit">
					<span class="jais-btn__text">Check My Wellbeing</span>
					<span class="jais-spinner" hidden></span>
				</button>
			</form>

			<div class="jais-result" hidden></div>

			<!-- 4-week trend chart rendered by JS from localStorage -->
			<div class="jais-burnout-trend" id="jais-burnout-trend" hidden>
				<h3 class="jais-section-title">📈 4-Week Trend</h3>
				<canvas id="jais-burnout-chart" width="500" height="180"></canvas>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	public function ajax_handler() {
		check_ajax_referer( 'jais_nonce', 'nonce' );

		$stress     = absint( $_POST['stress']     ?? 3 );
		$sleep      = absint( $_POST['sleep']      ?? 3 );
		$workload   = absint( $_POST['workload']   ?? 3 );
		$motivation = absint( $_POST['motivation'] ?? 3 );
		$balance    = absint( $_POST['balance']    ?? 3 );

		// Clamp to 1–5.
		$clamp = function( int $v ): int { return max( 1, min( 5, $v ) ); };
		$stress     = $clamp( $stress );
		$sleep      = $clamp( $sleep );
		$workload   = $clamp( $workload );
		$motivation = $clamp( $motivation );
		$balance    = $clamp( $balance );

		$prompt = "You are a healthcare worker wellbeing advisor specialising in supporting UK private healthcare professionals.
Always reference CQC registration pressures, NHS vs private sector working conditions, and UK-specific wellbeing resources where relevant.

Based on these weekly self-assessment scores from a UK private healthcare professional, provide a wellbeing analysis.

Weekly scores (1 = lowest/worst, 5 = highest/best):
- Stress Level: {$stress}/5 (1=very low stress, 5=overwhelming stress)
- Sleep Quality: {$sleep}/5 (1=very poor, 5=excellent)
- Workload: {$workload}/5 (1=very light, 5=unmanageable)
- Motivation: {$motivation}/5 (1=very low, 5=high)
- Work-Life Balance: {$balance}/5 (1=very poor, 5=excellent)

Return ONLY valid JSON:
{
  \"riskLevel\": \"Low\",
  \"riskScore\": 28,
  \"recommendations\": [
    \"Specific actionable recommendation 1 relevant to UK private healthcare workers\",
    \"Specific actionable recommendation 2\",
    \"Specific actionable recommendation 3\"
  ],
  \"motivationalNote\": \"Warm, practical, non-judgmental 2-sentence supportive message for this healthcare professional\",
  \"weekSummary\": \"One sentence summarising what the scores suggest about this person's week\"
}

riskLevel must be exactly one of: Low, Medium, High, Critical.
riskScore is 0-100 (100 = highest burnout risk).
Be warm, practical, and non-judgmental. Return ONLY JSON.";

		$api      = new JAIS_API();
		$response = $api->call( $prompt, 1024, 'burnout' );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( $response->get_error_message() );
		}

		$data = JAIS_API::parse_json( $response );
		if ( empty( $data ) ) {
			wp_send_json_error( 'Could not parse AI response. Please try again.' );
		}

		// Include the raw scores so JS can store them for the trend chart.
		$data['scores'] = compact( 'stress', 'sleep', 'workload', 'motivation', 'balance' );
		$data['date']   = date( 'Y-m-d' );

		wp_send_json_success( $data );
	}
}
