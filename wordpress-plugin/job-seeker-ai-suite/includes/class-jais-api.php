<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_API {

	private $api_key;
	private $model   = 'claude-sonnet-4-6';
	private $api_url = 'https://api.anthropic.com/v1/messages';

	public function __construct() {
		$this->api_key = get_option( 'jais_api_key', '' );
	}

	/**
	 * Call the Anthropic Messages API.
	 *
	 * @param string $prompt     Full user prompt.
	 * @param int    $max_tokens Max tokens for the response.
	 * @param string $module     Module slug used for token logging.
	 * @return string|WP_Error   Raw response text or WP_Error.
	 */
	public function call( string $prompt, int $max_tokens = 1024, string $module = '' ) {
		if ( empty( $this->api_key ) ) {
			return new WP_Error( 'no_api_key', 'Anthropic API key is not configured. Please set it in Job Seeker AI → Settings.' );
		}

		$body = wp_json_encode( [
			'model'      => $this->model,
			'max_tokens' => $max_tokens,
			'messages'   => [
				[ 'role' => 'user', 'content' => $prompt ],
			],
		] );

		$response = wp_remote_post( $this->api_url, [
			'timeout' => 90,
			'headers' => [
				'x-api-key'         => $this->api_key,
				'anthropic-version' => '2023-06-01',
				'content-type'      => 'application/json',
			],
			'body'    => $body,
		] );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$http_code   = wp_remote_retrieve_response_code( $response );
		$parsed_body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $parsed_body['error'] ) ) {
			return new WP_Error( 'api_error', $parsed_body['error']['message'] ?? 'Unknown API error' );
		}

		if ( $http_code !== 200 ) {
			return new WP_Error( 'http_error', "API returned HTTP {$http_code}" );
		}

		// Log token usage.
		if ( ! empty( $module ) && isset( $parsed_body['usage'] ) ) {
			$this->log_usage( $module, $parsed_body['usage'] );
		}

		return $parsed_body['content'][0]['text'] ?? '';
	}

	/**
	 * Append token counts to jais_usage_log in wp_options.
	 */
	private function log_usage( string $module, array $usage ) {
		$log = get_option( 'jais_usage_log', [] );
		if ( ! isset( $log[ $module ] ) ) {
			$log[ $module ] = [ 'input_tokens' => 0, 'output_tokens' => 0, 'calls' => 0, 'last_call' => '' ];
		}
		$log[ $module ]['input_tokens']  += (int) ( $usage['input_tokens']  ?? 0 );
		$log[ $module ]['output_tokens'] += (int) ( $usage['output_tokens'] ?? 0 );
		$log[ $module ]['calls']++;
		$log[ $module ]['last_call'] = current_time( 'mysql' );
		update_option( 'jais_usage_log', $log );
	}

	/**
	 * Parse JSON from Claude response, stripping accidental markdown fences.
	 */
	public static function parse_json( string $text ): array {
		// Strip ```json ... ``` or ``` ... ``` wrappers.
		$clean = preg_replace( '/^```(?:json)?\s*/i', '', trim( $text ) );
		$clean = preg_replace( '/\s*```$/', '', $clean );
		$data  = json_decode( trim( $clean ), true );
		return is_array( $data ) ? $data : [];
	}
}
