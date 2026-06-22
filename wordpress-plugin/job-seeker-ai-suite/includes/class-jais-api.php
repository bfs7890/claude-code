<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_API {

	private string $provider;
	private string $api_key;
	private string $model;

	private const PROVIDERS = [
		'anthropic' => [
			'url'     => 'https://api.anthropic.com/v1/messages',
			'models'  => [
				'claude-sonnet-4-6'        => 'Claude Sonnet 4.6 (Recommended)',
				'claude-haiku-4-5-20251001' => 'Claude Haiku 4.5 (Cheaper)',
				'claude-opus-4-8'          => 'Claude Opus 4.8 (Most Capable)',
			],
			'default' => 'claude-sonnet-4-6',
		],
		'openai' => [
			'url'     => 'https://api.openai.com/v1/chat/completions',
			'models'  => [
				'gpt-4o-mini' => 'GPT-4o Mini (Cheapest)',
				'gpt-4o'      => 'GPT-4o (Best Quality)',
			],
			'default' => 'gpt-4o-mini',
		],
		'google' => [
			'url'     => 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
			'models'  => [
				'gemini-2.0-flash'   => 'Gemini 2.0 Flash (Best Value)',
				'gemini-1.5-pro'     => 'Gemini 1.5 Pro (High Quality)',
			],
			'default' => 'gemini-2.0-flash',
		],
	];

	public function __construct() {
		$this->provider = get_option( 'jais_provider', 'anthropic' );
		$key_option     = 'anthropic' === $this->provider ? 'jais_api_key' : "jais_api_key_{$this->provider}";
		$this->api_key  = get_option( $key_option, '' );
		$this->model    = get_option( "jais_model_{$this->provider}", self::PROVIDERS[ $this->provider ]['default'] ?? '' );
	}

	public static function get_providers(): array {
		return self::PROVIDERS;
	}

	/**
	 * Call the configured AI provider.
	 */
	public function call( string $prompt, int $max_tokens = 1024, string $module = '' ) {
		if ( empty( $this->api_key ) ) {
			$label = ucfirst( $this->provider );
			return new WP_Error( 'no_api_key', "{$label} API key is not configured. Please set it in Job Seeker AI → Settings." );
		}

		switch ( $this->provider ) {
			case 'openai':
				return $this->call_openai( $prompt, $max_tokens, $module );
			case 'google':
				return $this->call_google( $prompt, $max_tokens, $module );
			default:
				return $this->call_anthropic( $prompt, $max_tokens, $module );
		}
	}

	private function call_anthropic( string $prompt, int $max_tokens, string $module ) {
		$body = wp_json_encode( [
			'model'      => $this->model,
			'max_tokens' => $max_tokens,
			'messages'   => [ [ 'role' => 'user', 'content' => $prompt ] ],
		] );

		$response = wp_remote_post( self::PROVIDERS['anthropic']['url'], [
			'timeout' => 90,
			'headers' => [
				'x-api-key'         => $this->api_key,
				'anthropic-version' => '2023-06-01',
				'content-type'      => 'application/json',
			],
			'body' => $body,
		] );

		if ( is_wp_error( $response ) ) return $response;

		$code   = wp_remote_retrieve_response_code( $response );
		$parsed = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $parsed['error'] ) ) {
			return new WP_Error( 'api_error', $parsed['error']['message'] ?? 'Unknown API error' );
		}
		if ( $code !== 200 ) {
			return new WP_Error( 'http_error', "API returned HTTP {$code}" );
		}

		if ( ! empty( $module ) && isset( $parsed['usage'] ) ) {
			$this->log_usage( $module, $parsed['usage'] );
		}

		return $parsed['content'][0]['text'] ?? '';
	}

	private function call_openai( string $prompt, int $max_tokens, string $module ) {
		$body = wp_json_encode( [
			'model'      => $this->model,
			'max_tokens' => $max_tokens,
			'messages'   => [ [ 'role' => 'user', 'content' => $prompt ] ],
		] );

		$response = wp_remote_post( self::PROVIDERS['openai']['url'], [
			'timeout' => 90,
			'headers' => [
				'Authorization' => 'Bearer ' . $this->api_key,
				'Content-Type'  => 'application/json',
			],
			'body' => $body,
		] );

		if ( is_wp_error( $response ) ) return $response;

		$code   = wp_remote_retrieve_response_code( $response );
		$parsed = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $parsed['error'] ) ) {
			return new WP_Error( 'api_error', $parsed['error']['message'] ?? 'Unknown API error' );
		}
		if ( $code !== 200 ) {
			return new WP_Error( 'http_error', "API returned HTTP {$code}" );
		}

		if ( ! empty( $module ) && isset( $parsed['usage'] ) ) {
			$this->log_usage( $module, [
				'input_tokens'  => $parsed['usage']['prompt_tokens'] ?? 0,
				'output_tokens' => $parsed['usage']['completion_tokens'] ?? 0,
			] );
		}

		return $parsed['choices'][0]['message']['content'] ?? '';
	}

	private function call_google( string $prompt, int $max_tokens, string $module ) {
		$url = str_replace( '{model}', $this->model, self::PROVIDERS['google']['url'] );
		$url = add_query_arg( 'key', $this->api_key, $url );

		$body = wp_json_encode( [
			'contents'         => [ [ 'parts' => [ [ 'text' => $prompt ] ] ] ],
			'generationConfig' => [ 'maxOutputTokens' => $max_tokens ],
		] );

		$response = wp_remote_post( $url, [
			'timeout' => 90,
			'headers' => [ 'Content-Type' => 'application/json' ],
			'body'    => $body,
		] );

		if ( is_wp_error( $response ) ) return $response;

		$code   = wp_remote_retrieve_response_code( $response );
		$parsed = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $parsed['error'] ) ) {
			return new WP_Error( 'api_error', $parsed['error']['message'] ?? 'Unknown API error' );
		}
		if ( $code !== 200 ) {
			return new WP_Error( 'http_error', "API returned HTTP {$code}" );
		}

		if ( ! empty( $module ) && isset( $parsed['usageMetadata'] ) ) {
			$this->log_usage( $module, [
				'input_tokens'  => $parsed['usageMetadata']['promptTokenCount'] ?? 0,
				'output_tokens' => $parsed['usageMetadata']['candidatesTokenCount'] ?? 0,
			] );
		}

		return $parsed['candidates'][0]['content']['parts'][0]['text'] ?? '';
	}

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

	public static function parse_json( string $text ): array {
		$clean = preg_replace( '/^```(?:json)?\s*/i', '', trim( $text ) );
		$clean = preg_replace( '/\s*```$/', '', $clean );
		$data  = json_decode( trim( $clean ), true );
		return is_array( $data ) ? $data : [];
	}
}
