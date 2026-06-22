<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class JAIS_Video_Sim {

	public function __construct() {
		add_shortcode( 'jais_video_sim', [ $this, 'render' ] );
		add_action( 'wp_ajax_jais_video_sim_start',    [ $this, 'ajax_start' ] );
		add_action( 'wp_ajax_nopriv_jais_video_sim_start', [ $this, 'ajax_start' ] );
		add_action( 'wp_ajax_jais_video_sim_evaluate',    [ $this, 'ajax_evaluate' ] );
		add_action( 'wp_ajax_nopriv_jais_video_sim_evaluate', [ $this, 'ajax_evaluate' ] );
	}

	public function render( $atts ): string {
		$gate = JAIS_Core::check_access( 'video_sim' );
		if ( true !== $gate ) return (string) $gate;

		ob_start();
		?>
		<div class="jais-card" id="jais-video-sim">
			<div class="jais-card__header">
				<span class="jais-icon">🎥</span>
				<div>
					<h2 class="jais-card__title">Video Interview Simulator</h2>
					<p class="jais-card__subtitle">Practice with AI-generated questions and get instant feedback</p>
				</div>
			</div>

			<!-- Step 1: Setup -->
			<div class="jais-vs-step" id="jais-vs-step-1">
				<form class="jais-form" data-action="jais_video_sim_start">
					<div class="jais-field">
						<label class="jais-label" for="jais-vs-title">Job Title <span class="jais-req">*</span></label>
						<input class="jais-input" id="jais-vs-title" name="job_title" type="text" placeholder="e.g. Registered Nurse — Private Hospital" required>
					</div>
					<div class="jais-field">
						<label class="jais-label" for="jais-vs-employer">Employer Name <span class="jais-req">*</span></label>
						<input class="jais-input" id="jais-vs-employer" name="employer_name" type="text" placeholder="e.g. Nuffield Health, Spire Healthcare…" required>
					</div>
					<button class="jais-btn jais-btn--blue" type="submit">
						<span class="jais-btn__text">Generate Interview Questions</span>
						<span class="jais-spinner" hidden></span>
					</button>
				</form>
			</div>

			<!-- Step 2: Interview (shown by JS) -->
			<div class="jais-vs-step" id="jais-vs-step-2" hidden>
				<div class="jais-vs-progress">
					<span id="jais-vs-q-num">Question 1</span> of <span id="jais-vs-q-total">5</span>
					<div class="jais-vs-progress-bar">
						<div class="jais-vs-progress-fill" id="jais-vs-progress-fill" style="width:20%"></div>
					</div>
				</div>
				<div class="jais-vs-question-box">
					<span class="jais-vs-category" id="jais-vs-category"></span>
					<p class="jais-vs-question" id="jais-vs-question"></p>
				</div>
				<form class="jais-form" id="jais-vs-answer-form">
					<div class="jais-field">
						<label class="jais-label" for="jais-vs-answer">Your Answer</label>
						<textarea class="jais-textarea" id="jais-vs-answer" name="answer" rows="5" placeholder="Type your answer here… speak naturally, as you would in a real interview"></textarea>
					</div>
					<button class="jais-btn jais-btn--pink" type="submit">
						<span class="jais-btn__text">Submit Answer</span>
						<span class="jais-spinner" hidden></span>
					</button>
				</form>
				<div class="jais-vs-feedback" id="jais-vs-feedback" hidden></div>
				<button class="jais-btn jais-btn--blue" id="jais-vs-next-btn" hidden>
					<span class="jais-btn__text">Next Question →</span>
				</button>
			</div>

			<!-- Step 3: Summary report (shown by JS) -->
			<div class="jais-vs-step" id="jais-vs-step-3" hidden>
				<h3 class="jais-section-title">📊 Interview Complete — Your Report</h3>
				<div id="jais-vs-report"></div>
				<button class="jais-btn" id="jais-vs-restart-btn">Start New Interview</button>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	public function ajax_start() {
		check_ajax_referer( 'jais_nonce', 'nonce' );

		$job_title     = sanitize_text_field( wp_unslash( $_POST['job_title']     ?? '' ) );
		$employer_name = sanitize_text_field( wp_unslash( $_POST['employer_name'] ?? '' ) );

		if ( empty( $job_title ) || empty( $employer_name ) ) {
			wp_send_json_error( 'Job title and employer name are required.' );
		}

		$prompt = "You are an expert interview coach preparing questions for a UK private healthcare interview.
Always reference CQC registration requirements and NHS vs private sector differences where relevant.

Generate 5 realistic interview questions for a {$job_title} role at {$employer_name} in UK private healthcare.

Return ONLY a valid JSON array of exactly 5 objects:
[
  {
    \"id\": 1,
    \"question\": \"Full interview question text\",
    \"category\": \"Behavioural\",
    \"difficulty\": \"Medium\"
  }
]

Categories: Technical, Behavioural, Situational, Culture Fit, Leadership, Role-specific.
Difficulty: Easy, Medium, Hard.
Mix categories and difficulties. Questions must be specific to UK private healthcare and the given role/employer.
Return ONLY the JSON array, no markdown.";

		$api      = new JAIS_API();
		$response = $api->call( $prompt, 1024, 'video_sim' );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( $response->get_error_message() );
		}

		$data = JAIS_API::parse_json( $response );
		if ( ! is_array( $data ) || empty( $data ) ) {
			wp_send_json_error( 'Could not generate interview questions. Please try again.' );
		}

		wp_send_json_success( [
			'questions'     => $data,
			'job_title'     => $job_title,
			'employer_name' => $employer_name,
		] );
	}

	public function ajax_evaluate() {
		check_ajax_referer( 'jais_nonce', 'nonce' );

		$question  = sanitize_textarea_field( wp_unslash( $_POST['question']  ?? '' ) );
		$answer    = sanitize_textarea_field( wp_unslash( $_POST['answer']    ?? '' ) );
		$job_title = sanitize_text_field( wp_unslash( $_POST['job_title']     ?? '' ) );
		$category  = sanitize_text_field( wp_unslash( $_POST['category']      ?? '' ) );

		if ( empty( $question ) || empty( $answer ) ) {
			wp_send_json_error( 'Question and answer are required.' );
		}

		$prompt = "You are an expert interview coach evaluating an answer for a UK private healthcare role.
Always reference CQC registration requirements, UK private sector standards, and NHS vs private differences where relevant.

**ROLE:** {$job_title}
**QUESTION CATEGORY:** {$category}
**INTERVIEW QUESTION:** {$question}
**CANDIDATE'S ANSWER:** {$answer}

Evaluate this answer and provide detailed coaching feedback.

Return ONLY valid JSON:
{
  \"clarityScore\": 4,
  \"confidenceScore\": 3,
  \"keyPointsCovered\": [\"specific point the candidate covered well\"],
  \"missingPoints\": [\"important point missing from the answer relevant to UK private healthcare\"],
  \"improvedAnswer\": \"A rewritten version of the answer incorporating missing points — 2-3 sentences, STAR format where applicable, UK private healthcare context included\",
  \"coachingTip\": \"One specific delivery or content tip for this type of question in UK private healthcare interviews\"
}

clarityScore and confidenceScore are 1-5 (5 = excellent).
Be constructive, warm, and specific. Return ONLY JSON.";

		$api      = new JAIS_API();
		$response = $api->call( $prompt, 1024, 'video_sim' );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( $response->get_error_message() );
		}

		$data = JAIS_API::parse_json( $response );
		if ( empty( $data ) ) {
			wp_send_json_error( 'Could not evaluate answer. Please try again.' );
		}

		wp_send_json_success( $data );
	}
}
