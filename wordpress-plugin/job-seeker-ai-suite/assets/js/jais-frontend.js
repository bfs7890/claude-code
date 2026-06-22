/* Job Seeker AI Suite — Frontend JS (vanilla, no jQuery) */
/* global jaisAjax */

(function () {
	'use strict';

	var jaisData = (typeof jaisAjax !== 'undefined') ? jaisAjax : {};

	/* ── Utilities ─────────────────────────────────────────── */

	function esc(str) {
		if (typeof str !== 'string') return String(str ?? '');
		return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
	}

	function post(action, data, btn) {
		var fd = new FormData();
		fd.append('action', action);
		fd.append('nonce', jaisData.nonce);
		Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });

		if (btn) {
			btn.disabled = true;
			var t = btn.querySelector('.jais-btn__text');
			var s = btn.querySelector('.jais-spinner');
			if (t) t.hidden = true;
			if (s) s.hidden = false;
		}

		return fetch(jaisData.ajaxurl, { method: 'POST', body: fd })
			.then(function (r) { return r.json(); })
			.finally(function () {
				if (btn) {
					btn.disabled = false;
					var t = btn.querySelector('.jais-btn__text');
					var s = btn.querySelector('.jais-spinner');
					if (t) t.hidden = false;
					if (s) s.hidden = true;
				}
			});
	}

	function resultPanel(card) {
		return card.querySelector('.jais-result');
	}

	function showResult(card, html, isError) {
		var panel = resultPanel(card);
		if (!panel) return;
		panel.hidden = false;
		panel.innerHTML = isError
			? '<div class="jais-error">⚠️ ' + esc(html) + '</div>'
			: html;
	}

	function copyToClipboard(text, btn) {
		navigator.clipboard.writeText(text).then(function () {
			var orig = btn.textContent;
			btn.textContent = 'Copied!';
			setTimeout(function () { btn.textContent = orig; }, 1800);
		});
	}

	function riskBadge(level) {
		var l = (level || '').toLowerCase();
		return '<span class="jais-risk-badge jais-risk-badge--' + esc(l) + '">' + esc(level) + '</span>';
	}

	function scoreBar(score, max) {
		max = max || 100;
		var pct = Math.min(100, Math.round((score / max) * 100));
		return '<div class="jais-score-bar-wrap"><div class="jais-score-bar" style="width:' + pct + '%"></div></div>';
	}

	function listHtml(items, cls) {
		if (!items || !items.length) return '';
		return '<ul class="jais-list ' + (cls || '') + '">'
			+ items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('')
			+ '</ul>';
	}

	function tagList(items, tagCls) {
		if (!items || !items.length) return '';
		return '<div class="jais-tags">'
			+ items.map(function (i) { return '<span class="jais-tag ' + (tagCls || '') + '">' + esc(i) + '</span>'; }).join('')
			+ '</div>';
	}

	/* ── Dashboard tab switching ─────────────────────────── */

	function initTabs() {
		var dashboard = document.querySelector('.jais-dashboard');
		if (!dashboard) return;

		dashboard.addEventListener('click', function (e) {
			var btn = e.target.closest('.jais-tab-btn');
			if (!btn) return;
			var target = btn.dataset.tab;
			dashboard.querySelectorAll('.jais-tab-btn').forEach(function (b) {
				b.classList.toggle('is-active', b === btn);
			});
			dashboard.querySelectorAll('.jais-tab-panel').forEach(function (p) {
				p.classList.toggle('is-active', p.id === 'jais-panel-' + target);
			});
		});

		// Activate first tab
		var firstBtn = dashboard.querySelector('.jais-tab-btn');
		if (firstBtn) firstBtn.click();
	}

	/* ── Sliders ────────────────────────────────────────── */

	function initSliders() {
		document.querySelectorAll('.jais-slider').forEach(function (slider) {
			var valEl = document.getElementById(slider.id + '-val');
			if (!valEl) return;
			slider.addEventListener('input', function () {
				valEl.textContent = slider.value;
			});
		});
	}

	/* ── Form submit delegation ──────────────────────────── */

	document.addEventListener('submit', function (e) {
		var form = e.target.closest('[data-action]');
		if (!form) return;
		e.preventDefault();

		var action = form.dataset.action;
		var card   = form.closest('.jais-card');
		var btn    = form.querySelector('[type=submit]');

		switch (action) {
			case 'jais_cv_tailor':     handleCvTailor(form, card, btn);     break;
			case 'jais_skills_gap':    handleSkillsGap(form, card, btn);    break;
			case 'jais_job_decoder':   handleJobDecoder(form, card, btn);   break;
			case 'jais_company_brief': handleCompanyBrief(form, card, btn); break;
			case 'jais_interview_prep':handleInterviewPrep(form, card, btn);break;
			case 'jais_negotiation':   handleNegotiation(form, card, btn);  break;
			case 'jais_prioritiser':   handlePrioritiser(form, card, btn);  break;
			case 'jais_burnout':       handleBurnout(form, card, btn);      break;
			case 'jais_video_sim_start': handleVideoSimStart(form, card, btn); break;
		}
	});

	/* ── CV Tailor ──────────────────────────────────────── */

	function handleCvTailor(form, card, btn) {
		var data = Object.fromEntries(new FormData(form));
		post('jais_cv_tailor', data, btn).then(function (res) {
			if (!res.success) { showResult(card, res.data, true); return; }
			var d = res.data;
			var html = '<h3 class="jais-section-title">✅ Tailored CV</h3>'
				+ '<div class="jais-score-row">'
				+ '<span class="jais-fw-600">Match Score</span>'
				+ scoreBar(d.matchScore, 100)
				+ '<span class="jais-score-num">' + esc(d.matchScore) + '%</span>'
				+ '</div>'
				+ '<div class="jais-briefing-section">'
				+ '<div class="jais-briefing-label">Summary</div>'
				+ '<p class="jais-text-sm">' + esc(d.summary) + '</p>'
				+ '</div>'
				+ (d.skills && d.skills.length ? '<div class="jais-briefing-section"><div class="jais-briefing-label">Key Skills</div>' + tagList(d.skills) + '</div>' : '')
				+ (d.experience && d.experience.length ? '<div class="jais-briefing-section"><div class="jais-briefing-label">Tailored Experience</div>' + listHtml(d.experience, 'jais-list--bullet') + '</div>' : '')
				+ (d.keyChanges && d.keyChanges.length ? '<div class="jais-briefing-section"><div class="jais-briefing-label">Key Changes Made</div>' + listHtml(d.keyChanges, 'jais-list--bullet') + '</div>' : '')
				+ (d.coverNote ? '<div class="jais-briefing-section"><div class="jais-briefing-label">Cover Note <button class="jais-copy-btn" data-copy="cover">Copy</button></div><div class="jais-email-box" id="jais-cv-cover">' + esc(d.coverNote) + '</div></div>' : '');
			showResult(card, html);
			var copyBtn = card.querySelector('[data-copy="cover"]');
			if (copyBtn) {
				copyBtn.addEventListener('click', function () {
					copyToClipboard(d.coverNote, copyBtn);
				});
			}
		});
	}

	/* ── Skills Gap ─────────────────────────────────────── */

	function handleSkillsGap(form, card, btn) {
		var data = Object.fromEntries(new FormData(form));
		post('jais_skills_gap', data, btn).then(function (res) {
			if (!res.success) { showResult(card, res.data, true); return; }
			var d = res.data;
			var html = '<h3 class="jais-section-title">📊 Skills Gap Analysis</h3>'
				+ '<div style="text-align:center;margin:16px 0">'
				+ '<div class="jais-gap-score">' + esc(d.gapScore) + '%</div>'
				+ '<div class="jais-text-muted jais-text-sm">Gap Score (0% = perfect match)</div>'
				+ '</div>'
				+ '<p class="jais-text-sm">' + esc(d.summary) + '</p>'
				+ '<hr class="jais-divider">'
				+ '<div class="jais-briefing-label" style="color:var(--jais-green)">✅ Skills You Have</div>'
				+ tagList(d.presentSkills, 'jais-tag--green')
				+ '<div class="jais-briefing-label jais-mt-16" style="color:var(--jais-red)">❌ Skills to Develop</div>'
				+ tagList(d.missingSkills, 'jais-tag--red')
				+ (d.learningPath && d.learningPath.length
					? '<hr class="jais-divider"><div class="jais-briefing-label">📚 Learning Path</div><ul class="jais-list jais-list--bullet">'
					+ d.learningPath.map(function (lp) {
						return '<li><strong>' + esc(lp.skill) + '</strong> — ' + esc(lp.resource) + ' (' + esc(lp.duration) + ')</li>';
					}).join('') + '</ul>'
					: '');
			showResult(card, html);
		});
	}

	/* ── Job Decoder ─────────────────────────────────────── */

	function handleJobDecoder(form, card, btn) {
		var data = Object.fromEntries(new FormData(form));
		post('jais_job_decoder', data, btn).then(function (res) {
			if (!res.success) { showResult(card, res.data, true); return; }
			var d = res.data;
			var ratingColors = { Good:'var(--jais-green)', Mixed:'var(--jais-yellow)', Poor:'var(--jais-red)' };
			var ratingColor = ratingColors[d.overallRating] || 'var(--jais-blue)';
			var html = '<h3 class="jais-section-title">🔍 Job Decoded</h3>'
				+ '<div class="jais-briefing-section"><div class="jais-briefing-label">Plain English Summary</div><p class="jais-text-sm">' + esc(d.plainSummary) + '</p></div>'
				+ '<div style="margin:12px 0"><span style="font-weight:700;color:' + ratingColor + '">Overall: ' + esc(d.overallRating) + '</span> — ' + esc(d.verdict) + '</div>'
				+ '<hr class="jais-divider">'
				+ (d.greenFlags && d.greenFlags.length ? '<div class="jais-briefing-label" style="color:var(--jais-green)">🟢 Green Flags</div>' + tagList(d.greenFlags, 'jais-tag--green') + '<br>' : '')
				+ (d.redFlags && d.redFlags.length ? '<div class="jais-briefing-label" style="color:var(--jais-red)">🔴 Red Flags</div>' + tagList(d.redFlags, 'jais-tag--red') + '<br>' : '')
				+ (d.realRequirements && d.realRequirements.length ? '<div class="jais-briefing-label">Must-Haves</div>' + listHtml(d.realRequirements, 'jais-list--bullet') : '')
				+ (d.niceToHave && d.niceToHave.length ? '<div class="jais-briefing-label jais-mt-8">Nice-to-Haves</div>' + listHtml(d.niceToHave, 'jais-list--bullet') : '')
				+ (d.cultureSignals && d.cultureSignals.length ? '<div class="jais-briefing-label jais-mt-8">Culture Signals</div>' + tagList(d.cultureSignals) : '');
			showResult(card, html);
		});
	}

	/* ── Company Brief ──────────────────────────────────── */

	function handleCompanyBrief(form, card, btn) {
		var data = Object.fromEntries(new FormData(form));
		post('jais_company_brief', data, btn).then(function (res) {
			if (!res.success) { showResult(card, res.data, true); return; }
			var d = res.data;
			var html = '<h3 class="jais-section-title">🏢 Company Briefing</h3>'
				+ '<div class="jais-briefing-section"><div class="jais-briefing-label">Overview</div><p class="jais-text-sm">' + esc(d.overview) + '</p></div>'
				+ (d.glassdoorSentiment ? '<div class="jais-briefing-section"><div class="jais-briefing-label">Employee Sentiment</div><p class="jais-text-sm">' + esc(d.glassdoorSentiment) + '</p></div>' : '')
				+ (d.verdict ? '<div class="jais-notice jais-mt-8">💡 ' + esc(d.verdict) + '</div>' : '')
				+ '<hr class="jais-divider">'
				+ (d.recentNews && d.recentNews.length ? '<div class="jais-briefing-label">Recent News / Trends</div>' + listHtml(d.recentNews, 'jais-list--bullet') : '')
				+ (d.techStack && d.techStack.length ? '<div class="jais-briefing-label jais-mt-8">Tech / Systems</div>' + tagList(d.techStack) : '')
				+ (d.cultureInsights && d.cultureInsights.length ? '<div class="jais-briefing-label jais-mt-8">Culture Insights</div>' + listHtml(d.cultureInsights, 'jais-list--bullet') : '')
				+ (d.keyPeople && d.keyPeople.length ? '<div class="jais-briefing-label jais-mt-8">Likely Interview Panel</div>' + tagList(d.keyPeople) : '')
				+ (d.interviewTips && d.interviewTips.length ? '<hr class="jais-divider"><div class="jais-briefing-label">Interview Tips</div>' + listHtml(d.interviewTips, 'jais-list--star') : '');
			showResult(card, html);
		});
	}

	/* ── Interview Prep ──────────────────────────────────── */

	function handleInterviewPrep(form, card, btn) {
		var data = Object.fromEntries(new FormData(form));
		post('jais_interview_prep', data, btn).then(function (res) {
			if (!res.success) { showResult(card, res.data, true); return; }
			var questions = res.data;
			var html = '<h3 class="jais-section-title">💬 Your Interview Questions</h3>';
			questions.forEach(function (q, i) {
				html += '<div class="jais-q-card">'
					+ '<div class="jais-q-num">Q' + (i + 1) + ' · ' + esc(q.category) + '</div>'
					+ '<p class="jais-q-text">' + esc(q.question) + '</p>'
					+ '<div class="jais-q-answer">' + esc(q.suggestedAnswer) + '</div>'
					+ (q.tip ? '<div class="jais-q-tip">💡 Tip: ' + esc(q.tip) + '</div>' : '')
					+ '</div>';
			});
			showResult(card, html);
		});
	}

	/* ── Negotiation ─────────────────────────────────────── */

	function handleNegotiation(form, card, btn) {
		var data = Object.fromEntries(new FormData(form));
		post('jais_negotiation', data, btn).then(function (res) {
			if (!res.success) { showResult(card, res.data, true); return; }
			var d = res.data;
			var html = '<h3 class="jais-section-title">💰 Negotiation Strategy</h3>'
				+ '<div class="jais-salary-row">'
				+ '<div class="jais-salary-chip"><div class="jais-salary-chip-label">Market Min</div><div class="jais-salary-chip-val">' + esc(d.marketMin) + '</div></div>'
				+ '<div class="jais-salary-chip"><div class="jais-salary-chip-label">Market Mid</div><div class="jais-salary-chip-val">' + esc(d.marketMid) + '</div></div>'
				+ '<div class="jais-salary-chip"><div class="jais-salary-chip-label">Market Max</div><div class="jais-salary-chip-val">' + esc(d.marketMax) + '</div></div>'
				+ '</div>'
				+ '<div class="jais-salary-chip" style="display:inline-block;margin-bottom:16px">'
				+ '<div class="jais-salary-chip-label">Suggested Counter-Offer</div>'
				+ '<div class="jais-salary-chip-val jais-salary-chip-val--counter" style="font-size:24px">' + esc(d.counterOffer) + '</div>'
				+ '</div>'
				+ (d.tactics && d.tactics.length ? '<div class="jais-briefing-label">Negotiation Tactics</div>' + listHtml(d.tactics, 'jais-list--bullet') : '')
				+ (d.leverage && d.leverage.length ? '<div class="jais-briefing-label jais-mt-8">Your Leverage Points</div>' + listHtml(d.leverage, 'jais-list--star') : '')
				+ (d.emailScript
					? '<hr class="jais-divider"><div class="jais-briefing-label">Ready-to-Send Email <button class="jais-copy-btn" id="jais-neg-copy">Copy Email</button></div><div class="jais-email-box" id="jais-neg-email">' + esc(d.emailScript) + '</div>'
					: '');
			showResult(card, html);
			var copyBtn = card.querySelector('#jais-neg-copy');
			if (copyBtn) {
				copyBtn.addEventListener('click', function () {
					copyToClipboard(d.emailScript, copyBtn);
				});
			}
		});
	}

	/* ── Job Prioritiser ─────────────────────────────────── */

	function handlePrioritiser(form, card, btn) {
		var data = Object.fromEntries(new FormData(form));
		post('jais_prioritiser', data, btn).then(function (res) {
			if (!res.success) { showResult(card, res.data, true); return; }
			var jobs = res.data;
			var html = '<h3 class="jais-section-title">📊 Ranked Job Listings</h3>';
			jobs.forEach(function (j, i) {
				html += '<div class="jais-job-rank-card">'
					+ '<div class="jais-job-rank-header">'
					+ '<div>'
					+ '<div style="font-size:11px;color:var(--jais-gray-400);text-transform:uppercase;letter-spacing:.5px">#' + (i + 1) + (i === 0 ? ' — Best Match' : '') + '</div>'
					+ '<div class="jais-job-rank-title">' + esc(j.jobTitle) + (j.company ? ' · ' + esc(j.company) : '') + '</div>'
					+ '</div>'
					+ '<div class="jais-job-rank-score">' + esc(j.score) + '<span style="font-size:14px;font-weight:400">/100</span></div>'
					+ '</div>'
					+ '<p class="jais-text-sm jais-mt-8">' + esc(j.reason) + '</p>'
					+ scoreBar(j.score, 100)
					+ (j.greenFlags && j.greenFlags.length ? '<div class="jais-mt-8">' + tagList(j.greenFlags, 'jais-tag--green') + '</div>' : '')
					+ (j.redFlags && j.redFlags.length ? '<div class="jais-mt-4">' + tagList(j.redFlags, 'jais-tag--red') + '</div>' : '')
					+ (j.salaryNote ? '<div class="jais-text-sm jais-text-muted jais-mt-8">💷 ' + esc(j.salaryNote) + '</div>' : '')
					+ '</div>';
			});
			showResult(card, html);
		});
	}

	/* ── Burnout Tracker ─────────────────────────────────── */

	function handleBurnout(form, card, btn) {
		var data = Object.fromEntries(new FormData(form));
		post('jais_burnout', data, btn).then(function (res) {
			if (!res.success) { showResult(card, res.data, true); return; }
			var d = res.data;
			var html = '<h3 class="jais-section-title">❤️ Wellbeing Report</h3>'
				+ '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">'
				+ riskBadge(d.riskLevel)
				+ '<div class="jais-score-row" style="flex:1;margin:0">'
				+ scoreBar(d.riskScore, 100)
				+ '<span class="jais-score-num">' + esc(d.riskScore) + '/100</span>'
				+ '</div>'
				+ '</div>'
				+ (d.weekSummary ? '<p class="jais-text-sm">' + esc(d.weekSummary) + '</p>' : '')
				+ (d.motivationalNote ? '<div class="jais-notice jais-mt-8">💙 ' + esc(d.motivationalNote) + '</div>' : '')
				+ (d.recommendations && d.recommendations.length
					? '<hr class="jais-divider"><div class="jais-briefing-label">Recommendations</div>' + listHtml(d.recommendations, 'jais-list--bullet')
					: '');
			showResult(card, html);

			// Save to localStorage for trend chart
			saveBurnoutEntry(d);
			renderBurnoutChart(card);
		});
	}

	function saveBurnoutEntry(data) {
		try {
			var history = JSON.parse(localStorage.getItem('jais_burnout_history') || '[]');
			history.unshift({ date: data.date, riskScore: data.riskScore, scores: data.scores });
			history = history.slice(0, 4); // keep 4 weeks
			localStorage.setItem('jais_burnout_history', JSON.stringify(history));
		} catch (e) {}
	}

	function renderBurnoutChart(card) {
		try {
			var history = JSON.parse(localStorage.getItem('jais_burnout_history') || '[]');
			if (history.length < 2) return;

			var trendEl = card.querySelector('#jais-burnout-trend');
			var canvas  = card.querySelector('#jais-burnout-chart');
			if (!trendEl || !canvas) return;

			trendEl.hidden = false;
			var ctx = canvas.getContext('2d');
			var w = canvas.width;
			var h = canvas.height;
			ctx.clearRect(0, 0, w, h);

			var pts = history.slice().reverse(); // oldest first
			var scores = pts.map(function (p) { return p.riskScore; });
			var labels = pts.map(function (p) { return p.date ? p.date.slice(5) : ''; });

			var padding = 32;
			var stepX = (w - padding * 2) / (pts.length - 1 || 1);
			var maxY = 100;

			// Grid lines
			ctx.strokeStyle = '#e5e7eb';
			ctx.lineWidth = 1;
			[0, 25, 50, 75, 100].forEach(function (v) {
				var y = h - padding - (v / maxY) * (h - padding * 2);
				ctx.beginPath();
				ctx.moveTo(padding, y);
				ctx.lineTo(w - padding, y);
				ctx.stroke();
				ctx.fillStyle = '#9ca3af';
				ctx.font = '10px sans-serif';
				ctx.fillText(v, 4, y + 4);
			});

			// Line
			ctx.strokeStyle = '#1B6CA8';
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			scores.forEach(function (s, i) {
				var x = padding + i * stepX;
				var y = h - padding - (s / maxY) * (h - padding * 2);
				if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
			});
			ctx.stroke();

			// Dots + labels
			scores.forEach(function (s, i) {
				var x = padding + i * stepX;
				var y = h - padding - (s / maxY) * (h - padding * 2);
				ctx.beginPath();
				ctx.arc(x, y, 5, 0, Math.PI * 2);
				ctx.fillStyle = '#1B6CA8';
				ctx.fill();
				ctx.fillStyle = '#1f2937';
				ctx.font = 'bold 11px sans-serif';
				ctx.fillText(s, x - 8, y - 9);
				ctx.fillStyle = '#9ca3af';
				ctx.font = '10px sans-serif';
				ctx.fillText(labels[i], x - 12, h - 6);
			});
		} catch (e) {}
	}

	/* ── Video Interview Simulator ───────────────────────── */

	var vsState = {
		questions: [],
		current: 0,
		jobTitle: '',
		employerName: '',
		results: [],
	};

	function handleVideoSimStart(form, card, btn) {
		var data = Object.fromEntries(new FormData(form));
		post('jais_video_sim_start', data, btn).then(function (res) {
			if (!res.success) { showResult(card, res.data, true); return; }
			vsState.questions    = res.data.questions;
			vsState.jobTitle     = res.data.job_title;
			vsState.employerName = res.data.employer_name;
			vsState.current      = 0;
			vsState.results      = [];

			var step1 = card.querySelector('#jais-vs-step-1');
			var step2 = card.querySelector('#jais-vs-step-2');
			if (step1) step1.hidden = true;
			if (step2) step2.hidden = false;

			vsShowQuestion(card);
		});
	}

	function vsShowQuestion(card) {
		var q = vsState.questions[vsState.current];
		if (!q) return;

		card.querySelector('#jais-vs-q-num').textContent  = 'Question ' + (vsState.current + 1);
		card.querySelector('#jais-vs-q-total').textContent = vsState.questions.length;
		card.querySelector('#jais-vs-category').textContent = q.category + ' · ' + q.difficulty;
		card.querySelector('#jais-vs-question').textContent = q.question;

		var fill = card.querySelector('#jais-vs-progress-fill');
		if (fill) fill.style.width = (((vsState.current + 1) / vsState.questions.length) * 100) + '%';

		var answerEl = card.querySelector('#jais-vs-answer');
		if (answerEl) answerEl.value = '';

		var feedbackEl = card.querySelector('#jais-vs-feedback');
		if (feedbackEl) feedbackEl.hidden = true;

		var nextBtn = card.querySelector('#jais-vs-next-btn');
		if (nextBtn) nextBtn.hidden = true;

		var answerForm = card.querySelector('#jais-vs-answer-form');
		if (answerForm) answerForm.hidden = false;
	}

	// Answer submission
	document.addEventListener('submit', function (e) {
		var form = e.target;
		if (form.id !== 'jais-vs-answer-form') return;
		e.preventDefault();

		var card = form.closest('.jais-card');
		var btn  = form.querySelector('[type=submit]');
		var answerEl = form.querySelector('#jais-vs-answer');
		var answer = answerEl ? answerEl.value.trim() : '';

		if (!answer) return;

		var q = vsState.questions[vsState.current];
		var data = {
			question:  q.question,
			answer:    answer,
			job_title: vsState.jobTitle,
			category:  q.category,
		};

		post('jais_video_sim_evaluate', data, btn).then(function (res) {
			if (!res.success) {
				var fb = card.querySelector('#jais-vs-feedback');
				if (fb) { fb.innerHTML = '<div class="jais-error">' + esc(res.data) + '</div>'; fb.hidden = false; }
				return;
			}
			var d = res.data;
			vsState.results.push({ question: q, answer: answer, feedback: d });

			var fb = card.querySelector('#jais-vs-feedback');
			if (fb) {
				fb.hidden = false;
				fb.innerHTML = '<div class="jais-vs-score-row">'
					+ '<div class="jais-vs-score-chip"><div class="jais-vs-score-chip-label">Clarity</div><div class="jais-vs-score-chip-val">' + esc(d.clarityScore) + '/5</div></div>'
					+ '<div class="jais-vs-score-chip"><div class="jais-vs-score-chip-label">Confidence</div><div class="jais-vs-score-chip-val">' + esc(d.confidenceScore) + '/5</div></div>'
					+ '</div>'
					+ (d.keyPointsCovered && d.keyPointsCovered.length ? '<div class="jais-briefing-label" style="color:var(--jais-green)">✅ Covered Well</div>' + listHtml(d.keyPointsCovered, 'jais-list--check') : '')
					+ (d.missingPoints && d.missingPoints.length ? '<div class="jais-briefing-label jais-mt-8" style="color:var(--jais-red)">❌ Missing Points</div>' + listHtml(d.missingPoints, 'jais-list--cross') : '')
					+ (d.improvedAnswer ? '<div class="jais-briefing-label jais-mt-8">💡 Improved Answer</div><div class="jais-q-answer">' + esc(d.improvedAnswer) + '</div>' : '')
					+ (d.coachingTip ? '<div class="jais-q-tip">🎯 ' + esc(d.coachingTip) + '</div>' : '');
			}

			var answerForm = card.querySelector('#jais-vs-answer-form');
			if (answerForm) answerForm.hidden = true;

			var nextBtn = card.querySelector('#jais-vs-next-btn');
			if (nextBtn) {
				nextBtn.hidden = false;
				var isLast = vsState.current >= vsState.questions.length - 1;
				nextBtn.querySelector('.jais-btn__text').textContent = isLast ? 'See Final Report' : 'Next Question →';
			}
		});
	});

	// Next / finish button
	document.addEventListener('click', function (e) {
		var btn = e.target.closest('#jais-vs-next-btn');
		if (!btn) return;
		var card = btn.closest('.jais-card');
		vsState.current++;

		if (vsState.current >= vsState.questions.length) {
			vsShowReport(card);
		} else {
			vsShowQuestion(card);
		}
	});

	// Restart
	document.addEventListener('click', function (e) {
		var btn = e.target.closest('#jais-vs-restart-btn');
		if (!btn) return;
		var card = btn.closest('.jais-card');
		card.querySelector('#jais-vs-step-3').hidden = true;
		card.querySelector('#jais-vs-step-2').hidden = true;
		card.querySelector('#jais-vs-step-1').hidden = false;
	});

	function vsShowReport(card) {
		var step2 = card.querySelector('#jais-vs-step-2');
		var step3 = card.querySelector('#jais-vs-step-3');
		if (step2) step2.hidden = true;
		if (step3) step3.hidden = false;

		var totalClarity    = 0;
		var totalConfidence = 0;
		vsState.results.forEach(function (r) {
			totalClarity    += (r.feedback.clarityScore    || 0);
			totalConfidence += (r.feedback.confidenceScore || 0);
		});
		var n = vsState.results.length || 1;
		var avgClarity    = (totalClarity    / n).toFixed(1);
		var avgConfidence = (totalConfidence / n).toFixed(1);

		var report = card.querySelector('#jais-vs-report');
		if (!report) return;

		var html = '<div class="jais-vs-score-row">'
			+ '<div class="jais-vs-score-chip"><div class="jais-vs-score-chip-label">Avg Clarity</div><div class="jais-vs-score-chip-val">' + avgClarity + '/5</div></div>'
			+ '<div class="jais-vs-score-chip"><div class="jais-vs-score-chip-label">Avg Confidence</div><div class="jais-vs-score-chip-val">' + avgConfidence + '/5</div></div>'
			+ '<div class="jais-vs-score-chip"><div class="jais-vs-score-chip-label">Questions Done</div><div class="jais-vs-score-chip-val">' + vsState.results.length + '</div></div>'
			+ '</div>';

		vsState.results.forEach(function (r, i) {
			html += '<div class="jais-q-card">'
				+ '<div class="jais-q-num">Q' + (i + 1) + ' · ' + esc(r.question.category) + '</div>'
				+ '<p class="jais-q-text">' + esc(r.question.question) + '</p>'
				+ '<div style="font-size:13px;color:var(--jais-gray-600)">Clarity: <strong>' + esc(r.feedback.clarityScore) + '/5</strong> · Confidence: <strong>' + esc(r.feedback.confidenceScore) + '/5</strong></div>'
				+ (r.feedback.improvedAnswer ? '<div class="jais-q-answer jais-mt-8">' + esc(r.feedback.improvedAnswer) + '</div>' : '')
				+ '</div>';
		});

		report.innerHTML = html;
	}

	/* ── Init ───────────────────────────────────────────── */

	document.addEventListener('DOMContentLoaded', function () {
		initTabs();
		initSliders();

		// Restore burnout chart if history exists
		document.querySelectorAll('#jais-burnout').forEach(function (card) {
			try {
				var history = JSON.parse(localStorage.getItem('jais_burnout_history') || '[]');
				if (history.length >= 2) renderBurnoutChart(card);
			} catch (e) {}
		});
	});

}());
