<?php
/**
 * Plugin Name:  Job Seeker AI Suite
 * Plugin URI:   https://example.com/job-seeker-ai-suite
 * Description:  Nine AI-powered job-seeking tools — CV tailoring, skills gap, job decoding, company briefings, interview prep, salary negotiation, job prioritiser, wellbeing tracker, and video interview simulator. Powered by Claude AI.
 * Version:      1.0.0
 * Author:       Job Seeker AI Suite
 * License:      GPL-2.0+
 * Text Domain:  job-seeker-ai-suite
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'JAIS_VERSION',    '1.0.0' );
define( 'JAIS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'JAIS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Load all files.
require_once JAIS_PLUGIN_DIR . 'includes/class-jais-api.php';
require_once JAIS_PLUGIN_DIR . 'includes/modules/class-jais-cv-tailor.php';
require_once JAIS_PLUGIN_DIR . 'includes/modules/class-jais-skills-gap.php';
require_once JAIS_PLUGIN_DIR . 'includes/modules/class-jais-job-decoder.php';
require_once JAIS_PLUGIN_DIR . 'includes/modules/class-jais-company-brief.php';
require_once JAIS_PLUGIN_DIR . 'includes/modules/class-jais-interview-prep.php';
require_once JAIS_PLUGIN_DIR . 'includes/modules/class-jais-negotiation.php';
require_once JAIS_PLUGIN_DIR . 'includes/modules/class-jais-prioritiser.php';
require_once JAIS_PLUGIN_DIR . 'includes/modules/class-jais-burnout.php';
require_once JAIS_PLUGIN_DIR . 'includes/modules/class-jais-video-sim.php';
require_once JAIS_PLUGIN_DIR . 'includes/class-jais-core.php';
require_once JAIS_PLUGIN_DIR . 'admin/class-jais-admin.php';

add_action( 'plugins_loaded', function () {
	JAIS_Core::get_instance();
	JAIS_Admin::get_instance();
} );
