"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, LoaderCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const topics = [
  "AI for the Web",
  "Frontend Architecture",
  "Web Accessibility",
  "Cybersecurity",
  "Design Systems",
  "Web Performance",
];

type Participation = "oral" | "poster" | "attendee";
type VisaSupport = "yes" | "no";
type RegistrationPayload = {
  fullName: string;
  email: string;
  degree: string;
  institution: string;
  department: string;
  paperTitle: string;
  topics: string[];
  participation: Participation;
  visaSupport: VisaSupport;
  notes: string;
};
type RegistrationResult = {
  reference: string;
  fullName: string;
  participation: Participation;
};

const formEndpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";

function collectPayload(
  form: HTMLFormElement,
  selectedTopics: string[],
  participation: Participation,
  visaSupport: VisaSupport,
): RegistrationPayload {
  const data = new FormData(form);
  return {
    fullName: String(data.get("fullName") ?? "").trim(),
    email: String(data.get("email") ?? "").trim(),
    degree: String(data.get("degree") ?? "").trim(),
    institution: String(data.get("institution") ?? "").trim(),
    department: String(data.get("department") ?? "").trim(),
    paperTitle: String(data.get("paperTitle") ?? "").trim(),
    topics: selectedTopics,
    participation,
    visaSupport,
    notes: String(data.get("notes") ?? "").trim(),
  };
}

async function createRegistration(payload: RegistrationPayload) {
  if (!formEndpoint) {
    throw new Error("Registration delivery is not configured yet.");
  }

  const reference = `WC27-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const response = await fetch(formEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...payload,
      topics: payload.topics.join(", "),
      reference,
      _subject: `WebCraft 2027 registration — ${reference}`,
      _template: "table",
    }),
  });
  const body = (await response.json()) as { success?: boolean; message?: string };
  if (!response.ok || body.success === false) {
    throw new Error(body.message || "We could not submit your registration.");
  }
  return { reference, fullName: payload.fullName, participation: payload.participation };
}

export default function Home() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [participation, setParticipation] = useState<Participation>("attendee");
  const [visaSupport, setVisaSupport] = useState<VisaSupport>("no");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState<RegistrationResult | null>(null);

  const topicSummary = useMemo(
    () => `${selectedTopics.length} / 3 selected`,
    [selectedTopics.length],
  );

  function toggleTopic(topic: string, checked: boolean) {
    setError("");
    setSelectedTopics((current) => {
      if (checked) {
        if (current.length >= 3) {
          setError("Choose no more than three conference tracks.");
          return current;
        }
        return [...current, topic];
      }
      return current.filter((item) => item !== topic);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (selectedTopics.length === 0) {
      setError("Choose at least one conference track.");
      return;
    }
    if (!agreed) {
      setError("Please confirm that the information is accurate.");
      return;
    }
    setStatus("submitting");
    try {
      const result = await createRegistration(
        collectPayload(event.currentTarget, selectedTopics, participation, visaSupport),
      );
      setRegistration(result);
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
      setStatus("idle");
    }
  }

  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      context.registerTool(
        {
          name: "submit_conference_registration",
          title: "Submit conference registration",
          description:
            "Submit a completed WebCraft Conference 2027 registration and return its reference number.",
          inputSchema: {
            type: "object",
            properties: {
              fullName: { type: "string", minLength: 2 },
              email: { type: "string", format: "email" },
              degree: { type: "string" },
              institution: { type: "string" },
              department: { type: "string" },
              paperTitle: { type: "string" },
              topics: {
                type: "array",
                items: { type: "string", enum: topics },
                minItems: 1,
                maxItems: 3,
                uniqueItems: true,
              },
              participation: { type: "string", enum: ["oral", "poster", "attendee"] },
              visaSupport: { type: "string", enum: ["yes", "no"] },
              notes: { type: "string" },
            },
            required: ["fullName", "email", "degree", "institution", "topics", "participation", "visaSupport"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute: async (input: RegistrationPayload) => {
            const result = await createRegistration(input);
            setRegistration(result);
            setStatus("success");
            return { reference: result.reference, status: "confirmed" };
          },
        },
        { signal: lifecycle.signal },
      );
    } catch {
      // Optional enhancement; the visible form remains fully functional.
    }
    return () => lifecycle.abort();
  }, []);

  function resetForm() {
    setSelectedTopics([]);
    setParticipation("attendee");
    setVisaSupport("no");
    setAgreed(false);
    setRegistration(null);
    setError("");
    setStatus("idle");
  }

  return (
    <main>
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="WebCraft Conference home">
          <span className="wordmark-box">W/C</span>
          <span>WEBCRAFT<br />CONFERENCE</span>
        </a>
        <p>HELSINKI + ONLINE</p>
        <p>16—18 SEP 2027</p>
      </header>

      <section className="hero" id="top">
        <div className="hero-kicker"><span>INTERNATIONAL CONFERENCE</span><span>REGISTRATION OPEN</span></div>
        <h1>THE WEB,<br /><em>SHAPED</em> TOGETHER.</h1>
        <div className="hero-bottom">
          <p>Three focused days for researchers, designers, and engineers building a more useful, resilient web.</p>
          <a href="#registration">Register now <ArrowRight aria-hidden="true" /></a>
        </div>
        <span className="hero-index" aria-hidden="true">27</span>
      </section>

      <section className="registration-wrap" id="registration">
        <div className="form-card">
          <aside className="form-aside">
            <p className="section-tag">REG / 027</p>
            <h2>{status === "success" ? "Registration complete." : "Reserve your place."}</h2>
            <p>{status === "success" ? "Your response is safely recorded." : "Complete the form in English. Fields marked with * are required."}</p>
            <dl>
              <div><dt>Deadline</dt><dd>30 June 2027</dd></div>
              <div><dt>Language</dt><dd>English</dd></div>
              <div><dt>Format</dt><dd>Hybrid</dd></div>
            </dl>
          </aside>

          <div className="form-main">
            {status === "success" && registration ? (
              <div className="success-card" role="status" aria-live="polite">
                <span className="success-check"><Check aria-hidden="true" /></span>
                <p className="section-tag">CONFIRMED</p>
                <h3>Thank you, {registration.fullName}.</h3>
                <p>Your registration has been received. Keep this reference number for future correspondence.</p>
                <div className="reference-block"><span>Registration reference</span><strong>{registration.reference}</strong></div>
                <div className="success-detail"><span>Participation</span><strong>{registration.participation === "oral" ? "Oral presentation" : registration.participation === "poster" ? "Poster session" : "Attendee only"}</strong></div>
                <Button type="button" variant="outline" size="lg" onClick={resetForm}><RotateCcw aria-hidden="true" /> Submit another response</Button>
              </div>
            ) : (
              <form className="registration-form" onSubmit={handleSubmit}>
                <fieldset>
                  <legend><span>01</span>Personal details</legend>
                  <div className="field-grid">
                    <label className="field field-wide"><span>Full name <b>*</b></span><Input name="fullName" autoComplete="name" placeholder="As shown in your passport" required maxLength={100} /></label>
                    <label className="field"><span>Email address <b>*</b></span><Input name="email" type="email" autoComplete="email" placeholder="name@example.com" required maxLength={160} /></label>
                    <label className="field"><span>Academic degree <b>*</b></span><NativeSelect name="degree" required defaultValue="" className="w-full"><NativeSelectOption value="" disabled>Select a degree</NativeSelectOption><NativeSelectOption value="Bachelor's student">Bachelor&apos;s student</NativeSelectOption><NativeSelectOption value="Master's student">Master&apos;s student</NativeSelectOption><NativeSelectOption value="PhD candidate">PhD candidate</NativeSelectOption><NativeSelectOption value="PhD / Researcher">PhD / Researcher</NativeSelectOption><NativeSelectOption value="Industry professional">Industry professional</NativeSelectOption><NativeSelectOption value="Other">Other</NativeSelectOption></NativeSelect></label>
                    <label className="field"><span>University or organisation <b>*</b></span><Input name="institution" placeholder="Your affiliation" required maxLength={140} /></label>
                    <label className="field"><span>Department / research lab</span><Input name="department" placeholder="Optional" maxLength={140} /></label>
                  </div>
                </fieldset>

                <fieldset>
                  <legend><span>02</span>Conference contribution</legend>
                  <div className="field-grid">
                    <label className="field field-wide"><span>Paper or talk title</span><Input name="paperTitle" placeholder="Leave blank if you are attending without a presentation" maxLength={180} /></label>
                    <div className="field field-wide">
                      <div className="field-heading"><span>Conference tracks <b>*</b></span><small>{topicSummary}</small></div>
                      <div className="topic-grid">
                        {topics.map((topic) => {
                          const checked = selectedTopics.includes(topic);
                          return <label className={`topic-option${checked ? " is-selected" : ""}`} key={topic}><Checkbox checked={checked} disabled={!checked && selectedTopics.length >= 3} onCheckedChange={(value) => toggleTopic(topic, value === true)} aria-label={topic} /><span>{topic}</span></label>;
                        })}
                      </div>
                    </div>
                    <div className="field"><span className="group-label">Presentation type <b>*</b></span><RadioGroup value={participation} onValueChange={(value) => setParticipation(value as Participation)}>{[["oral", "Oral presentation"], ["poster", "Poster session"], ["attendee", "Attendee only"]].map(([value, label]) => <label className="radio-option" key={value}><RadioGroupItem value={value} aria-label={label} /><span>{label}</span></label>)}</RadioGroup></div>
                    <div className="field"><span className="group-label">Visa support letter <b>*</b></span><RadioGroup value={visaSupport} onValueChange={(value) => setVisaSupport(value as VisaSupport)} className="radio-inline"><label className="radio-option"><RadioGroupItem value="yes" aria-label="Yes" /><span>Yes</span></label><label className="radio-option"><RadioGroupItem value="no" aria-label="No" /><span>No</span></label></RadioGroup></div>
                    <label className="field field-wide"><span>Accessibility, dietary, or other notes</span><Textarea name="notes" placeholder="Tell us what would help you participate fully (optional)" rows={3} maxLength={600} /></label>
                  </div>
                </fieldset>

                <div className="form-footer">
                  <label className="agreement"><Checkbox checked={agreed} onCheckedChange={(value) => setAgreed(value === true)} aria-label="Confirm information is accurate" /><span>I confirm that the information above is accurate. <b>*</b></span></label>
                  {error && <p className="form-error" role="alert">{error}</p>}
                  <Button type="submit" size="lg" disabled={status === "submitting"} className="submit-button">{status === "submitting" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}{status === "submitting" ? "Submitting…" : "Submit registration"}{status !== "submitting" ? <ArrowRight aria-hidden="true" /> : null}</Button>
                  <p className="privacy-note">Your details are used only to organise this event. Submission delivery is provided by FormSubmit.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer><span>WEBCRAFT / 2027</span><span>BUILD ACCESSIBLY. SHIP RESPONSIBLY.</span></footer>
    </main>
  );
}
