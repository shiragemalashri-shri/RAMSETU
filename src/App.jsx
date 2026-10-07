import { useEffect, useState } from "react";

export default function App() {
  const validScreens = [
    "home",
    "candidate",
    "case",
    "tracking",
    "reviewer",
    "review",
  ];

  const getScreenFromHash = () => {
    const currentHash = window.location.hash.replace("#", "");
    if (validScreens.includes(currentHash)) {
      return currentHash;
    }
    return "home";
  };

  const [screen, setScreenState] = useState(getScreenFromHash);

  const setScreen = (nextScreen) => {
    if (!validScreens.includes(nextScreen)) return;

    setScreenState(nextScreen);

    window.history.pushState(
      { screen: nextScreen },
      "",
      `#${nextScreen}`
    );
  };

  useEffect(() => {
    const handleBrowserNavigation = () => {
      setScreenState(getScreenFromHash());
    };

    window.addEventListener("popstate", handleBrowserNavigation);

    return () => {
      window.removeEventListener("popstate", handleBrowserNavigation);
    };
  }, []);

  const [caseStatus, setCaseStatus] = useState("Under Review");
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [decision, setDecision] = useState(null);
  const [decisionReason, setDecisionReason] = useState("");

  // Load real case data from FastAPI
  useEffect(() => {
    const loadCase = async () => {
      try {
        const result = await fetch("http://127.0.0.1:8000/api/case");

        if (!result.ok) {
          throw new Error("Failed to load case");
        }

        const data = await result.json();

        if (data.status) {
          setCaseStatus(data.status);
        }

        if (data.candidate_response) {
          setResponse(data.candidate_response);
          setSubmitted(true);
        }

        if (data.reviewer_decision) {
          setDecision(data.reviewer_decision);
        }

        if (data.decision_reason) {
          setDecisionReason(data.decision_reason);
        }
      } catch (error) {
        console.error("Case loading failed:", error);
      }
    };

    loadCase();
  }, []);

  // Candidate response
  const submitResponse = async () => {
    if (!response.trim()) return;

    try {
      const result = await fetch(
        "http://127.0.0.1:8000/api/case/respond",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            case_id: "RM-1024",
            response: response,
          }),
        }
      );

      if (!result.ok) {
        throw new Error("Failed to submit response");
      }

      const data = await result.json();

      setSubmitted(true);
      setCaseStatus(data.status);
      setScreen("tracking");
    } catch (error) {
      console.error("Response submission failed:", error);
      alert("Unable to submit response. Please try again.");
    }
  };

  // Reviewer decision
  const submitDecision = async (value) => {
    if (!decisionReason.trim()) {
      alert("Please enter the decision reason first.");
      return;
    }

    try {
      const result = await fetch(
        "http://127.0.0.1:8000/api/case/decision",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            case_id: "RM-1024",
            decision: value,
            reason: decisionReason,
          }),
        }
      );

      if (!result.ok) {
        throw new Error("Failed to submit reviewer decision");
      }

      const data = await result.json();

      setDecision(value);
      setCaseStatus(data.status);
    } catch (error) {
      console.error("Reviewer decision failed:", error);
      alert("Unable to save reviewer decision. Please try again.");
    }
  };

  /* =====================================================
     HOME
  ===================================================== */

  if (screen === "home") {
    return (
      <div className="min-h-screen bg-[#07142f] text-white">
        <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl">
              R
            </div>

            <div>
              <h1 className="text-xl font-bold">
                RAM<span className="text-blue-400">SETU</span>
              </h1>

              <p className="text-xs text-slate-400">
                Examination Integrity Platform
              </p>
            </div>
          </div>

          <span className="hidden md:block text-sm text-slate-400">
            SEVA Innovation Challenge 2026
          </span>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm">
                Secure • Transparent • Human-supervised
              </span>

              <h2 className="text-5xl md:text-6xl font-bold leading-tight mt-7">
                Making examination
                <span className="text-blue-400">
                  {" "}resolution fair.
                </span>
              </h2>

              <p className="text-slate-400 text-lg leading-relaxed mt-6 max-w-xl">
                RAMSETU connects examination incidents, candidate responses,
                evidence, human review and transparent resolution in one
                digital workflow.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mt-9">
                <button
                  onClick={() => setScreen("candidate")}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-xl font-semibold transition"
                >
                  Candidate Portal →
                </button>

                <button
                  onClick={() => setScreen("reviewer")}
                  className="bg-white/10 hover:bg-white/15 border border-white/10 px-6 py-4 rounded-xl font-semibold transition"
                >
                  Reviewer Portal →
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-7 text-slate-900 shadow-2xl">
              <div className="flex justify-between items-center mb-7">
                <div>
                  <p className="text-xs text-slate-400">SAMPLE CASE</p>
                  <h3 className="text-2xl font-bold">RM-1024</h3>
                </div>

                <StatusBadge status={caseStatus} />
              </div>

              <div className="space-y-5">
                <Step
                  number="✓"
                  title="Incident Recorded"
                  text="Case created"
                  done
                />

                <Step
                  number="✓"
                  title="Candidate Response"
                  text="Explanation submitted"
                  done
                />

                <Step
                  number="●"
                  title="Human Review"
                  text="Authorized reviewer evaluates the case"
                  active
                />

                <Step
                  number="4"
                  title="Resolution"
                  text="Decision and reason"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =====================================================
     CANDIDATE DASHBOARD
  ===================================================== */

  if (screen === "candidate") {
    return (
      <Layout
        title="Candidate Portal"
        subtitle="Examination Integrity & Fair Resolution"
        onBack={() => setScreen("home")}
      >
        <div className="mb-8">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
            Candidate Dashboard
          </p>

          <h2 className="text-3xl font-bold mt-2">
            Welcome, Malashri
          </h2>

          <p className="text-slate-500 mt-2">
            Manage your examination case and resolution status.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
                ✓
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Candidate Verification
                </p>

                <h3 className="font-bold text-lg">
                  Verification Record Available
                </h3>
              </div>
            </div>

            <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              Verified
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <InfoCard
            label="Examination"
            value="Public Examination 2026"
            small="Candidate ID: RS-2026-1042"
          />

          <InfoCard
            label="Centre"
            value="Centre 104"
            small="Maharashtra"
          />

          <InfoCard
            label="Examination Date"
            value="10 October 2026"
            small="Examination completed"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold">
              My Examination Case
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Review the incident and submit your explanation.
            </p>
          </div>

          <div className="p-6">
            <div className="border border-slate-200 rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">
                      RM-1024
                    </span>

                    <StatusBadge status={caseStatus} />
                  </div>

                  <p className="text-slate-600 mt-2">
                    Suspected Examination Irregularity
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    Created: 10 October 2026
                  </p>
                </div>

                <button
                  onClick={() => setScreen("case")}
                  className="bg-[#0b1736] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  View Case →
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  /* =====================================================
     CASE DETAILS
  ===================================================== */

  if (screen === "case") {
    return (
      <Layout
        title="Case Details"
        subtitle="Case RM-1024"
        onBack={() => setScreen("candidate")}
      >
        <div className="mb-7">
          <button
            onClick={() => setScreen("candidate")}
            className="text-sm text-blue-600 font-medium"
          >
            ← Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between mt-5 gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Examination Case
              </p>

              <h2 className="text-3xl font-bold">
                RM-1024
              </h2>
            </div>

            <StatusBadge status={caseStatus} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold mb-5">
              Incident Information
            </h3>

            <div className="grid md:grid-cols-2 gap-5">
              <InfoCard
                label="Incident Type"
                value="Suspected Examination Irregularity"
              />

              <InfoCard
                label="Examination"
                value="Public Examination 2026"
              />

              <InfoCard
                label="Centre"
                value="Centre 104"
              />

              <InfoCard
                label="Recorded On"
                value="10 October 2026"
              />
            </div>

            <div className="mt-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700">
                Incident Description
              </p>

              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                An examination-related incident was recorded during the
                examination session. The case has been created for review
                and the candidate has been given an opportunity to respond.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-lg">
              Available Evidence
            </h3>

            <div className="mt-5 space-y-3">
              <Evidence name="Incident Record" />
              <Evidence name="Examination Session Record" />
            </div>

            <p className="text-xs text-slate-400 mt-5">
              Evidence is shown for review and response purposes.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">
                Candidate Response
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Explain the incident and provide supporting information.
              </p>
            </div>

            {submitted && (
              <span className="bg-green-50 text-green-700 px-3 py-2 rounded-full text-xs font-semibold">
                Response Submitted
              </span>
            )}
          </div>

          {!submitted ? (
            <div className="mt-5">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows="6"
                placeholder="Write your explanation here..."
                className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="mt-4 flex flex-col md:flex-row justify-between gap-4">
                <label className="border border-slate-300 rounded-xl px-5 py-3 text-sm cursor-pointer hover:bg-slate-50">
                  + Attach Supporting Evidence
                  <input type="file" className="hidden" />
                </label>

                <button
                  onClick={submitResponse}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold"
                >
                  Submit Explanation →
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="font-semibold text-green-800">
                Your explanation has been submitted successfully.
              </p>

              <p className="text-sm text-green-700 mt-2">
                The case is now available for human review.
              </p>

              <button
                onClick={() => setScreen("tracking")}
                className="mt-4 bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
              >
                Track Case →
              </button>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  /* =====================================================
     CASE TRACKING
  ===================================================== */

  if (screen === "tracking") {
    return (
      <Layout
        title="Case Tracking"
        subtitle="RM-1024"
        onBack={() => setScreen("candidate")}
      >
        <div className="max-w-4xl">
          <div className="bg-white rounded-2xl border border-slate-200 p-7">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-sm text-slate-500">
                  Case ID
                </p>

                <h2 className="text-3xl font-bold">
                  RM-1024
                </h2>
              </div>

              <StatusBadge status={caseStatus} />
            </div>

            <Timeline />

            <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="font-semibold text-blue-900">
                What happens next?
              </p>

              <p className="text-sm text-blue-800 mt-2">
                An authorized reviewer will examine the recorded incident,
                available evidence and your submitted explanation before
                recording a decision and reason.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
    if (screen === "reviewer") {
    return (
      <Layout
        title="Reviewer Dashboard"
        subtitle="Examination Integrity Review"
        onBack={() => setScreen("home")}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <InfoCard
            label="Open Cases"
            value="12"
            description="Cases awaiting review"
          />

          <InfoCard
            label="Resolved"
            value="8"
            description="Cases resolved"
          />

          <InfoCard
            label="Under Review"
            value="24"
            description="Cases being processed"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Cases Requiring Attention
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Review candidate explanations and supporting evidence.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <ReviewCase
              caseId="RM-1024"
              candidateId="RS-2026-1042"
              type="Suspected Examination Irregularity"
              status={caseStatus}
              onClick={() => setScreen("review")}
            />

            <ReviewCase
              caseId="RM-1025"
              candidateId="RS-2026-1057"
              type="Candidate Verification Issue"
              status="Under Review"
              onClick={() => setScreen("review")}
            />
          </div>
        </div>
      </Layout>
    );
  }

  if (screen === "review") {
    return (
      <Layout
        title="Case Review"
        subtitle="RM-1024"
        onBack={() => setScreen("reviewer")}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Case ID
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    RM-1024
                  </h2>
                </div>

                <StatusBadge status={caseStatus} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoCard
                  label="Candidate ID"
                  value="RS-2026-1042"
                />

                <InfoCard
                  label="Incident Type"
                  value="Suspected Examination Irregularity"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Candidate Explanation
              </h2>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                {response ? (
                  <p className="text-slate-700 leading-7">
                    {response}
                  </p>
                ) : (
                  <p className="text-slate-500 italic">
                    No candidate explanation submitted yet.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Supporting Evidence
              </h2>

              <Evidence
                title="Candidate Explanation"
                description="Written explanation submitted by candidate"
                available={Boolean(response)}
              />

              <Evidence
                title="Examination Incident Record"
                description="System-generated incident information"
                available
              />

              <Evidence
                title="Verification Record"
                description="Candidate verification information"
                available
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Reviewer Decision
              </h2>

              <p className="text-sm text-slate-500 mb-5">
                Final decision must be made by the authorized human reviewer.
              </p>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Decision Reason
              </label>

              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Enter the reason for your decision..."
                rows={5}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-300 resize-none"
              />

              <div className="flex flex-wrap gap-3 mt-5">

                <button
                  onClick={() => submitDecision("Resolved")}
                  className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                  Resolve Case
                </button>

                <button
                  onClick={() => submitDecision("Further Review")}
                  className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition"
                >
                  Request Further Review
                </button>
              </div>

              {decision && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Current Decision
                  </p>

                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {decision}
                  </p>

                  {decisionReason && (
                    <p className="text-sm text-slate-600 mt-2">
                      {decisionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                AI Assistance
              </h2>

              <p className="text-sm text-slate-500 leading-6 mb-5">
                AI assistance helps the reviewer organize case information.
                Final decisions remain with the authorized human reviewer.
              </p>

              <AIItem
                title="Case Classification"
                value="Examination Integrity"
              />

              <AIItem
                title="Duplicate Check"
                value="No strong duplicate detected"
              />

              <AIItem
                title="Evidence Summary"
                value="Candidate explanation available"
              />

              <AIItem
                title="Risk Indicator"
                value="Requires human review"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-5">
                Case Timeline
              </h2>

              <Timeline
                status={caseStatus}
                submitted={submitted}
                decision={decision}
              />
            </div>

          </div>
        </div>
      </Layout>
    );
  }

  return null;
}


/* =========================
   REUSABLE COMPONENTS
========================= */

function Layout({ title, subtitle, onBack, children }) {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      <header className="bg-[#071A33] text-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">

          <div>
            <div className="text-xl font-bold tracking-wide">
              RAMSETU
            </div>

            <div className="text-sm text-slate-300 mt-1">
              {title}
              {subtitle ? ` • ${subtitle}` : ""}
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10 transition"
            >
              ← Back
            </button>
          )}

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}


function InfoCard({ label, value, description }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </p>

      <p className="text-xl font-bold text-slate-900 mt-2">
        {value}
      </p>

      {description && (
        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>
      )}

    </div>
  );
}


function StatusBadge({ status }) {
  let classes =
    "bg-amber-50 text-amber-700 border-amber-200";

  if (status === "Resolved") {
    classes =
      "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Further Review") {
    classes =
      "bg-orange-50 text-orange-700 border-orange-200";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold ${classes}`}
    >
      {status}
    </span>
  );
}


function Evidence({ title, description, available }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-b-0">

      <div>
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>
      </div>

      <span
        className={`text-xs font-bold px-3 py-1.5 rounded-full ${
          available
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {available ? "Available" : "Not Available"}
      </span>

    </div>
  );
}


function Step({ number, title, description, completed }) {
  return (
    <div className="flex gap-4">

      <div
        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
          completed
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {completed ? "✓" : number}
      </div>

      <div className="pt-1">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>
      </div>

    </div>
  );
}


function Timeline({ status, submitted, decision }) {
  return (
    <div className="space-y-6">

      <Step
        number="1"
        title="Case Created"
        description="Incident case was created in RAMSETU."
        completed
      />

      <Step
        number="2"
        title="Candidate Response"
        description={
          submitted
            ? "Candidate explanation has been submitted."
            : "Waiting for candidate explanation."
        }
        completed={submitted}
      />

      <Step
        number="3"
        title="Human Review"
        description={
          decision
            ? "Reviewer has recorded a decision."
            : "Case is awaiting reviewer decision."
        }
        completed={Boolean(decision)}
      />

      <Step
        number="4"
        title="Resolution"
        description={
          status === "Resolved"
            ? "Case has been resolved."
            : status === "Further Review"
            ? "Case requires further review."
            : "Final resolution is pending."
        }
        completed={status === "Resolved" || status === "Further Review"}
      />

    </div>
  );
}


function AIItem({ title, value }) {
  return (
    <div className="py-4 border-b border-slate-100 last:border-b-0">

      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {title}
      </p>

      <p className="text-sm font-semibold text-slate-900 mt-1">
        {value}
      </p>

    </div>
  );
}


function ReviewCase({
  caseId,
  candidateId,
  type,
  status,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-6 hover:bg-slate-50 transition"
    >
      <div className="flex items-start justify-between gap-5">

        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-slate-900">
              {caseId}
            </h3>

            <StatusBadge status={status} />
          </div>

          <p className="text-sm text-slate-500 mt-2">
            Candidate ID: {candidateId}
          </p>

          <p className="text-sm font-medium text-slate-700 mt-1">
            {type}
          </p>
        </div>

        <span className="text-slate-400 text-xl">
          →
        </span>

      </div>
    </button>
  );
}