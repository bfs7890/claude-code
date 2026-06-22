<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Core {

	private static $instance;

	private $modules = [];

	public static function get_instance(): self {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		$this->modules = [
			'cv_tailor'      => new JAIS_CV_Tailor(),
			'skills_gap'     => new JAIS_Skills_Gap(),
			'job_decoder'    => new JAIS_Job_Decoder(),
			'company_brief'  => new JAIS_Company_Brief(),
			'interview_prep' => new JAIS_Interview_Prep(),
			'negotiation'    => new JAIS_Negotiation(),
			'prioritiser'    => new JAIS_Prioritiser(),
			'burnout'        => new JAIS_Burnout(),
			'video_sim'      => new JAIS_Video_Sim(),
		];

		add_shortcode( 'jais_dashboard', [ $this, 'render_dashboard' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );
	}

	public function enqueue_assets() {
		wp_enqueue_style(
			'jais-frontend',
			JAIS_PLUGIN_URL . 'assets/css/jais-frontend.css',
			[],
			JAIS_VERSION
		);
		wp_enqueue_script(
			'jais-frontend',
			JAIS_PLUGIN_URL . 'assets/js/jais-frontend.js',
			[],
			JAIS_VERSION,
			true
		);
		wp_localize_script( 'jais-frontend', 'jaisAjax', [
			'ajaxurl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'jais_nonce' ),
		] );
	}

	/**
	 * Check access level for a module.
	 * Returns true if allowed, or an HTML string with the gate message.
	 *
	 * @param string $module Module slug.
	 * @return true|string
	 */
	public static function check_access( string $module ) {
		// Respect per-module enabled toggle.
		if ( ! get_option( 'jais_enabled_' . $module, '1' ) ) {
			return '';
		}

		$access = get_option( 'jais_access_' . $module, 'everyone' );

		if ( 'logged_in' === $access && ! is_user_logged_in() ) {
			$login_url = wp_login_url( get_permalink() );
			return sprintf(
				'<div class="jais-gate"><p>🔒 Please <a href="%s">create a free account</a> to access this tool.</p></div>',
				esc_url( $login_url )
			);
		}

		if ( 'premium' === $access ) {
			$user = wp_get_current_user();
			if ( ! in_array( 'premium_member', (array) $user->roles, true ) ) {
				return '<div class="jais-gate jais-gate--premium"><p>⭐ <strong>Premium feature.</strong> <a href="#">Upgrade your account</a> to unlock this tool.</p></div>';
			}
		}

		return true;
	}

	/**
	 * Render all 9 tools in a tabbed dashboard.
	 */
	public function render_dashboard( $atts ): string {
		$gate = self::check_access( 'dashboard' );
		if ( true !== $gate ) {
			return (string) $gate;
		}

		$tabs = [
			'cv_tailor'      => '✨ CV Tailor',
			'skills_gap'     => '⚡ Skills Gap',
			'job_decoder'    => '🔍 Job Decoder',
			'company_brief'  => '🏢 Company Brief',
			'interview_prep' => '💬 Interview Prep',
			'negotiation'    => '💰 Negotiation',
			'prioritiser'    => '📊 Prioritiser',
			'burnout'        => '❤️ Wellbeing',
			'video_sim'      => '🎥 Interview Sim',
		];

		ob_start();
		?>
		<div class="jais-dashboard" id="jais-dashboard">
			<div class="jais-tabs" role="tablist">
				<?php $first = true; foreach ( $tabs as $key => $label ) : ?>
					<button
						class="jais-tab-btn<?php echo $first ? ' is-active' : ''; ?>"
						data-tab="<?php echo esc_attr( $key ); ?>"
						role="tab"
						aria-selected="<?php echo $first ? 'true' : 'false'; ?>"
						aria-controls="jais-panel-<?php echo esc_attr( $key ); ?>"
					>
						<?php echo esc_html( $label ); ?>
					</button>
				<?php $first = false; endforeach; ?>
			</div>

			<div class="jais-tab-panels">
				<?php $first = true; foreach ( $tabs as $key => $label ) : ?>
					<div
						class="jais-tab-panel<?php echo $first ? ' is-active' : ''; ?>"
						id="jais-panel-<?php echo esc_attr( $key ); ?>"
						role="tabpanel"
					>
						<?php
						if ( isset( $this->modules[ $key ] ) ) {
							echo $this->modules[ $key ]->render( [] ); // phpcs:ignore
						}
						?>
					</div>
				<?php $first = false; endforeach; ?>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}
}
