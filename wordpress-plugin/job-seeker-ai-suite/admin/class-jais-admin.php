<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Admin {

	private static ?self $instance = null;

	private array $modules = [
		'cv_tailor'     => 'CV Tailor',
		'skills_gap'    => 'Skills Gap Analyser',
		'job_decoder'   => 'Job Decoder',
		'company_brief' => 'Company Briefing',
		'interview_prep'=> 'Interview Prep Coach',
		'negotiation'   => 'Salary Negotiation Coach',
		'prioritiser'   => 'Smart Job Prioritiser',
		'burnout'       => 'Wellbeing & Burnout Tracker',
		'video_sim'     => 'Video Interview Simulator',
	];

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'admin_menu',    [ $this, 'register_menu' ] );
		add_action( 'admin_init',    [ $this, 'register_settings' ] );
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
		register_setting( 'jais_settings_group', 'jais_api_key', [
			'sanitize_callback' => 'sanitize_text_field',
		] );
		register_setting( 'jais_settings_group', 'jais_model', [
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => 'claude-sonnet-4-6',
		] );

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
		?>
		<div class="wrap jais-admin-wrap">
			<h1>
				<span class="dashicons dashicons-superhero" style="font-size:28px;vertical-align:middle;margin-right:8px;color:#1B6CA8"></span>
				Job Seeker AI Suite
				<span class="jais-version">v<?php echo esc_html( JAIS_VERSION ); ?></span>
			</h1>

			<nav class="nav-tab-wrapper">
				<a href="?page=jais-settings&tab=general"  class="nav-tab <?php echo $active_tab === 'general'  ? 'nav-tab-active' : ''; ?>">General</a>
				<a href="?page=jais-settings&tab=modules"  class="nav-tab <?php echo $active_tab === 'modules'  ? 'nav-tab-active' : ''; ?>">Modules</a>
				<a href="?page=jais-settings&tab=usage"    class="nav-tab <?php echo $active_tab === 'usage'    ? 'nav-tab-active' : ''; ?>">Token Usage</a>
				<a href="?page=jais-settings&tab=shortcodes" class="nav-tab <?php echo $active_tab === 'shortcodes' ? 'nav-tab-active' : ''; ?>">Shortcodes</a>
			</nav>

			<form method="post" action="options.php">
				<?php settings_fields( 'jais_settings_group' ); ?>

				<?php if ( $active_tab === 'general' ) : ?>
				<div class="jais-tab-content">
					<div class="jais-settings-card">
						<h2>API Configuration</h2>
						<table class="form-table">
							<tr>
								<th scope="row"><label for="jais_api_key">Anthropic API Key</label></th>
								<td>
									<input
										type="password"
										id="jais_api_key"
										name="jais_api_key"
										value="<?php echo esc_attr( get_option( 'jais_api_key', '' ) ); ?>"
										class="regular-text"
										autocomplete="new-password"
										placeholder="sk-ant-…"
									>
									<p class="description">Your Anthropic API key. Never shared with users or exposed to the frontend.</p>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="jais_model">Claude Model</label></th>
								<td>
									<select id="jais_model" name="jais_model">
										<?php
										$models = [
											'claude-sonnet-4-6' => 'Claude Sonnet 4.6 (Recommended)',
											'claude-haiku-4-5-20251001' => 'Claude Haiku 4.5 (Faster / Cheaper)',
											'claude-opus-4-8'   => 'Claude Opus 4.8 (Most Capable)',
										];
										$current_model = get_option( 'jais_model', 'claude-sonnet-4-6' );
										foreach ( $models as $id => $label ) {
											printf(
												'<option value="%s" %s>%s</option>',
												esc_attr( $id ),
												selected( $current_model, $id, false ),
												esc_html( $label )
											);
										}
										?>
									</select>
								</td>
							</tr>
						</table>
					</div>

					<div class="jais-settings-card">
						<h2>Dashboard Shortcode</h2>
						<p>Place all tools in a single tabbed dashboard:</p>
						<code class="jais-shortcode-display">[jais_dashboard]</code>
					</div>

					<?php submit_button( 'Save Settings' ); ?>
				</div>

				<?php elseif ( $active_tab === 'modules' ) : ?>
				<div class="jais-tab-content">
					<div class="jais-settings-card">
						<h2>Module Access Control</h2>
						<p>Enable or disable each module and set its access level.</p>
						<table class="widefat jais-modules-table">
							<thead>
								<tr>
									<th>Module</th>
									<th>Enabled</th>
									<th>Access Level</th>
								</tr>
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
								<?php foreach ( $this->modules as $key => $label ) :
									$slug = str_replace( '_', '-', $key );
								?>
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
