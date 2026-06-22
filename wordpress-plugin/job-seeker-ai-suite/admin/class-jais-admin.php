<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Admin {

	private static ?self $instance = null;

	private array $modules = [
		'cv_tailor'      => 'CV Tailor',
		'skills_gap'     => 'Skills Gap Analyser',
		'job_decoder'    => 'Job Decoder',
		'company_brief'  => 'Company Briefing',
		'interview_prep' => 'Interview Prep Coach',
		'negotiation'    => 'Salary Negotiation Coach',
		'prioritiser'    => 'Smart Job Prioritiser',
		'burnout'        => 'Wellbeing & Burnout Tracker',
		'video_sim'      => 'Video Interview Simulator',
	];

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'admin_menu',            [ $this, 'register_menu' ] );
		add_action( 'admin_init',            [ $this, 'register_settings' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
	}

	public function register_menu(): void {
		add_menu_page(
			'Job Seeker AI Suite',
			'Job Seeker AI',
			'manage_options',
			'jais-settings',
			[ $this, 'render_settings_page' ],
			'dashicons-superhero',
			56
		);
	}

	public function register_settings(): void {
		$providers = JAIS_API::get_providers();

		register_setting( 'jais_settings_group', 'jais_provider', [
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => 'anthropic',
		] );

		// Legacy Anthropic key option.
		register_setting( 'jais_settings_group', 'jais_api_key', [
			'sanitize_callback' => 'sanitize_text_field',
		] );

		foreach ( array_keys( $providers ) as $provider ) {
			register_setting( 'jais_settings_group', "jais_api_key_{$provider}", [
				'sanitize_callback' => 'sanitize_text_field',
			] );
			register_setting( 'jais_settings_group', "jais_model_{$provider}", [
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => $providers[ $provider ]['default'],
			] );
		}

		foreach ( array_keys( $this->modules ) as $key ) {
			register_setting( 'jais_settings_group', "jais_enabled_{$key}", [
				'sanitize_callback' => 'absint',
				'default'           => 1,
			] );
			register_setting( 'jais_settings_group', "jais_access_{$key}", [
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'everyone',
			] );
		}
	}

	public function enqueue_admin_assets( string $hook ): void {
		if ( 'toplevel_page_jais-settings' !== $hook ) return;
		wp_enqueue_style( 'jais-admin', JAIS_PLUGIN_URL . 'admin/jais-admin.css', [], JAIS_VERSION );
	}

	public function render_settings_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) return;

		$active_tab = sanitize_key( $_GET['tab'] ?? 'general' );
		$usage_log  = get_option( 'jais_usage_log', [] );
		$providers  = JAIS_API::get_providers();
		$current_provider = get_option( 'jais_provider', 'anthropic' );

		$provider_labels = [
			'anthropic' => 'Anthropic (Claude)',
			'openai'    => 'OpenAI (GPT)',
			'google'    => 'Google (Gemini)',
		];

		$provider_costs = [
			'anthropic' => 'Sonnet ~$0.010/query · Haiku ~$0.002/query',
			'openai'    => 'GPT-4o Mini ~$0.0003/query · GPT-4o ~$0.005/query',
			'google'    => 'Gemini Flash ~$0.0002/query · 1.5 Pro ~$0.002/query',
		];
		?>
		<div class="wrap jais-admin-wrap">
			<h1>
				<span class="dashicons dashicons-superhero" style="font-size:28px;vertical-align:middle;margin-right:8px;color:#1B6CA8"></span>
				Job Seeker AI Suite
				<span class="jais-version">v<?php echo esc_html( JAIS_VERSION ); ?></span>
			</h1>

			<nav class="nav-tab-wrapper">
				<a href="?page=jais-settings&tab=general"    class="nav-tab <?php echo $active_tab === 'general'    ? 'nav-tab-active' : ''; ?>">General</a>
				<a href="?page=jais-settings&tab=modules"    class="nav-tab <?php echo $active_tab === 'modules'    ? 'nav-tab-active' : ''; ?>">Modules</a>
				<a href="?page=jais-settings&tab=usage"      class="nav-tab <?php echo $active_tab === 'usage'      ? 'nav-tab-active' : ''; ?>">Token Usage</a>
				<a href="?page=jais-settings&tab=shortcodes" class="nav-tab <?php echo $active_tab === 'shortcodes' ? 'nav-tab-active' : ''; ?>">Shortcodes</a>
			</nav>

			<form method="post" action="options.php">
				<?php settings_fields( 'jais_settings_group' ); ?>

				<?php if ( $active_tab === 'general' ) : ?>
				<div class="jais-tab-content">

					<div class="jais-settings-card">
						<h2>AI Provider</h2>
						<table class="form-table">
							<tr>
								<th scope="row"><label for="jais_provider">Provider</label></th>
								<td>
									<select id="jais_provider" name="jais_provider" onchange="jaisToggleProvider(this.value)">
										<?php foreach ( $provider_labels as $val => $label ) : ?>
											<option value="<?php echo esc_attr( $val ); ?>" <?php selected( $current_provider, $val ); ?>>
												<?php echo esc_html( $label ); ?>
											</option>
										<?php endforeach; ?>
									</select>
									<p class="description" id="jais-provider-cost">
										<?php echo esc_html( $provider_costs[ $current_provider ] ?? '' ); ?>
									</p>
								</td>
							</tr>
						</table>
					</div>

					<?php foreach ( $providers as $provider => $config ) :
						$api_key_option = 'anthropic' === $provider ? 'jais_api_key' : "jais_api_key_{$provider}";
						$current_key    = get_option( $api_key_option, '' );
						$current_model  = get_option( "jais_model_{$provider}", $config['default'] );
						$placeholders   = [
							'anthropic' => 'sk-ant-…',
							'openai'    => 'sk-…',
							'google'    => 'AIza…',
						];
					?>
					<div class="jais-settings-card jais-provider-card" id="jais-card-<?php echo esc_attr( $provider ); ?>" style="<?php echo $provider !== $current_provider ? 'display:none' : ''; ?>">
						<h2><?php echo esc_html( $provider_labels[ $provider ] ); ?> Configuration</h2>
						<table class="form-table">
							<tr>
								<th scope="row"><label for="jais_api_key_<?php echo esc_attr( $provider ); ?>">API Key</label></th>
								<td>
									<input
										type="password"
										id="jais_api_key_<?php echo esc_attr( $provider ); ?>"
										name="<?php echo esc_attr( $api_key_option ); ?>"
										value="<?php echo esc_attr( $current_key ); ?>"
										class="regular-text"
										autocomplete="new-password"
										placeholder="<?php echo esc_attr( $placeholders[ $provider ] ?? '' ); ?>"
									>
									<?php if ( 'anthropic' === $provider ) : ?>
										<p class="description">Get your key at <strong>console.anthropic.com</strong></p>
									<?php elseif ( 'openai' === $provider ) : ?>
										<p class="description">Get your key at <strong>platform.openai.com/api-keys</strong></p>
									<?php elseif ( 'google' === $provider ) : ?>
										<p class="description">Get your key at <strong>aistudio.google.com</strong> — free tier: 1,500 requests/day</p>
									<?php endif; ?>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="jais_model_<?php echo esc_attr( $provider ); ?>">Model</label></th>
								<td>
									<select id="jais_model_<?php echo esc_attr( $provider ); ?>" name="jais_model_<?php echo esc_attr( $provider ); ?>">
										<?php foreach ( $config['models'] as $model_id => $model_label ) : ?>
											<option value="<?php echo esc_attr( $model_id ); ?>" <?php selected( $current_model, $model_id ); ?>>
												<?php echo esc_html( $model_label ); ?>
											</option>
										<?php endforeach; ?>
									</select>
								</td>
							</tr>
						</table>
					</div>
					<?php endforeach; ?>

					<div class="jais-settings-card">
						<h2>Dashboard Shortcode</h2>
						<p>Place all tools in a single tabbed dashboard:</p>
						<code class="jais-shortcode-display">[jais_dashboard]</code>
					</div>

					<?php submit_button( 'Save Settings' ); ?>
				</div>

				<script>
				var jaisProviderCosts = <?php echo wp_json_encode( $provider_costs ); ?>;
				function jaisToggleProvider(val) {
					document.querySelectorAll('.jais-provider-card').forEach(function(el) {
						el.style.display = 'none';
					});
					var card = document.getElementById('jais-card-' + val);
					if (card) card.style.display = 'block';
					var costEl = document.getElementById('jais-provider-cost');
					if (costEl) costEl.textContent = jaisProviderCosts[val] || '';
				}
				</script>

				<?php elseif ( $active_tab === 'modules' ) : ?>
				<div class="jais-tab-content">
					<div class="jais-settings-card">
						<h2>Module Access Control</h2>
						<p>Enable or disable each module and set its access level.</p>
						<table class="widefat jais-modules-table">
							<thead>
								<tr><th>Module</th><th>Enabled</th><th>Access Level</th></tr>
							</thead>
							<tbody>
								<?php foreach ( $this->modules as $key => $label ) : ?>
								<tr>
									<td><strong><?php echo esc_html( $label ); ?></strong></td>
									<td>
										<label class="jais-toggle">
											<input
												type="checkbox"
												name="jais_enabled_<?php echo esc_attr( $key ); ?>"
												value="1"
												<?php checked( 1, get_option( "jais_enabled_{$key}", 1 ) ); ?>
											>
											<span class="jais-toggle-slider"></span>
										</label>
									</td>
									<td>
										<select name="jais_access_<?php echo esc_attr( $key ); ?>">
											<?php
											$access_opts = [
												'everyone'  => 'Everyone (public)',
												'logged_in' => 'Logged-in users',
												'premium'   => 'Premium members only',
											];
											$current = get_option( "jais_access_{$key}", 'everyone' );
											foreach ( $access_opts as $val => $opt_label ) {
												printf(
													'<option value="%s" %s>%s</option>',
													esc_attr( $val ),
													selected( $current, $val, false ),
													esc_html( $opt_label )
												);
											}
											?>
										</select>
									</td>
								</tr>
								<?php endforeach; ?>
							</tbody>
						</table>
					</div>
					<?php submit_button( 'Save Settings' ); ?>
				</div>

				<?php elseif ( $active_tab === 'usage' ) : ?>
				<div class="jais-tab-content">
					<div class="jais-settings-card">
						<h2>Token Usage &amp; API Costs</h2>
						<?php if ( empty( $usage_log ) ) : ?>
							<p>No usage recorded yet. Token usage will appear here after the first AI call.</p>
						<?php else : ?>
						<table class="widefat jais-usage-table">
							<thead>
								<tr>
									<th>Module</th>
									<th>Calls</th>
									<th>Input Tokens</th>
									<th>Output Tokens</th>
									<th>Total Tokens</th>
									<th>Last Call</th>
								</tr>
							</thead>
							<tbody>
								<?php
								$total_in = $total_out = $total_calls = 0;
								foreach ( $usage_log as $module => $log ) :
									$in    = (int) ( $log['input_tokens']  ?? 0 );
									$out   = (int) ( $log['output_tokens'] ?? 0 );
									$calls = (int) ( $log['calls']         ?? 0 );
									$last  = $log['last_call'] ?? '—';
									$total_in    += $in;
									$total_out   += $out;
									$total_calls += $calls;
									$module_label = $this->modules[ $module ] ?? ucwords( str_replace( '_', ' ', $module ) );
								?>
								<tr>
									<td><?php echo esc_html( $module_label ); ?></td>
									<td><?php echo esc_html( number_format( $calls ) ); ?></td>
									<td><?php echo esc_html( number_format( $in ) ); ?></td>
									<td><?php echo esc_html( number_format( $out ) ); ?></td>
									<td><?php echo esc_html( number_format( $in + $out ) ); ?></td>
									<td><?php echo esc_html( $last ); ?></td>
								</tr>
								<?php endforeach; ?>
							</tbody>
							<tfoot>
								<tr>
									<th>TOTAL</th>
									<th><?php echo esc_html( number_format( $total_calls ) ); ?></th>
									<th><?php echo esc_html( number_format( $total_in ) ); ?></th>
									<th><?php echo esc_html( number_format( $total_out ) ); ?></th>
									<th><?php echo esc_html( number_format( $total_in + $total_out ) ); ?></th>
									<th></th>
								</tr>
							</tfoot>
						</table>
						<p class="description" style="margin-top:12px">
							<button type="button" class="button" id="jais-clear-usage">Clear Usage Log</button>
						</p>
						<script>
						document.getElementById('jais-clear-usage').addEventListener('click', function() {
							if (!confirm('Clear all token usage data?')) return;
							fetch(ajaxurl, {
								method: 'POST',
								headers: {'Content-Type': 'application/x-www-form-urlencoded'},
								body: 'action=jais_clear_usage&nonce=<?php echo esc_js( wp_create_nonce( 'jais_admin_nonce' ) ); ?>'
							}).then(function(r) { return r.json(); }).then(function(d) {
								if (d.success) location.reload();
							});
						});
						</script>
						<?php endif; ?>
					</div>
				</div>

				<?php elseif ( $active_tab === 'shortcodes' ) : ?>
				<div class="jais-tab-content">
					<div class="jais-settings-card">
						<h2>Available Shortcodes</h2>
						<table class="widefat">
							<thead><tr><th>Module</th><th>Shortcode</th></tr></thead>
							<tbody>
								<tr><td><strong>All Tools (Tabbed Dashboard)</strong></td><td><code>[jais_dashboard]</code></td></tr>
								<?php foreach ( $this->modules as $key => $label ) : ?>
								<tr>
									<td><?php echo esc_html( $label ); ?></td>
									<td><code>[jais_<?php echo esc_html( $key ); ?>]</code></td>
								</tr>
								<?php endforeach; ?>
							</tbody>
						</table>
					</div>
				</div>
				<?php endif; ?>

			</form>
		</div>
		<?php
	}
}

// AJAX: clear usage log (admin only).
add_action( 'wp_ajax_jais_clear_usage', function() {
	check_ajax_referer( 'jais_admin_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( 'Unauthorised' );
	}
	delete_option( 'jais_usage_log' );
	wp_send_json_success();
} );
