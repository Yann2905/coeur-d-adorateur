import nodemailer from "nodemailer";
import type { RegistrationInput } from "./validations";
import { PROGRAM_NAME, PROGRAM_DATE_LABEL } from "./constants";
import { getAppBaseUrl } from "./app-url";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

interface BrevoRecipient {
  email: string;
  name?: string;
}

type SendParams = {
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
};

/**
 * Envoi via Gmail SMTP (serveurs de Google).
 * L'expéditeur étant une vraie adresse @gmail.com authentifiée par Google,
 * les messages ne sont plus bloqués comme spam. Gratuit (~500 emails/jour).
 */
async function sendViaGmail(
  params: SendParams
): Promise<{ ok: boolean; error?: string }> {
  const user = process.env.GMAIL_USER;
  // Le mot de passe d'application Google est affiché avec des espaces : on les retire.
  const pass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  if (!user || !pass) {
    return {
      ok: false,
      error: "GMAIL_USER / GMAIL_APP_PASSWORD manquant",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME || PROGRAM_NAME}" <${user}>`,
      to: params.to.map((t) => t.email).join(","),
      subject: params.subject,
      html: params.htmlContent,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Envoi via l'API transactionnelle Brevo (repli). */
async function sendViaBrevo(
  params: SendParams
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { ok: false, error: "BREVO_API_KEY manquant" };

  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!senderEmail) return { ok: false, error: "BREVO_SENDER_EMAIL manquant" };

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: senderEmail,
          name: process.env.BREVO_SENDER_NAME || PROGRAM_NAME,
        },
        to: params.to,
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Brevo ${res.status}: ${text}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Envoi générique.
 * Priorité à Gmail SMTP (fiable et gratuit) s'il est configuré,
 * sinon repli sur Brevo.
 */
async function sendEmail(
  params: SendParams
): Promise<{ ok: boolean; error?: string }> {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return sendViaGmail(params);
  }
  return sendViaBrevo(params);
}

/** Envoie ses identifiants à un nouvel administrateur. */
export async function sendNewAdminEmail(params: {
  email: string;
  prenom: string;
  nom: string;
  password: string;
  role: string;
}): Promise<{ ok: boolean; error?: string }> {
  const loginUrl = `${getAppBaseUrl()}/admin/login`;
  const roleLabel =
    params.role === "super_admin" ? "Super administrateur" : "Administrateur";

  const cred = (label: string, value: string) =>
    `<div style="margin-bottom:10px;">
       <div style="color:#6b7280;font-size:12px;margin-bottom:3px;">${label}</div>
       <div style="color:#111827;font-size:15px;font-weight:700;font-family:'Courier New',monospace;background:#f4f1fb;border:1px solid #e6e0f5;border-radius:8px;padding:10px 12px;word-break:break-all;">${value}</div>
     </div>`;

  const htmlContent = `
  <div style="background:#f6f5fb;padding:16px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #eceafc;">
      <div style="background:linear-gradient(135deg,#5b21b6,#7c3aed);padding:20px 20px;text-align:center;">
        <h1 style="color:#ffffff;font-size:17px;margin:0 0 2px;">${PROGRAM_NAME}</h1>
        <p style="color:#e9d5ff;font-size:12px;margin:0;">Accès administrateur</p>
      </div>
      <div style="padding:20px;">
        <p style="color:#111827;font-size:14px;margin:0 0 4px;">Bonjour ${params.prenom} ${params.nom},</p>
        <p style="color:#374151;font-size:13px;margin:0 0 14px;">
          Un compte <strong>${roleLabel}</strong> a été créé pour toi. Voici tes
          identifiants de connexion :
        </p>
        ${cred("Identifiant (email)", params.email)}
        ${cred("Mot de passe", params.password)}
        <div style="background:#fef9ec;border:1px solid #f5e2b3;border-radius:8px;padding:10px 12px;margin:12px 0;">
          <p style="color:#92670a;font-size:12px;margin:0;">
            Garde ces informations confidentielles. Un changement de mot de passe
            te sera demandé à ta première connexion.
          </p>
        </div>
        <div style="text-align:center;margin-top:18px;">
          <a href="${loginUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 24px;border-radius:9px;">
            Me connecter
          </a>
        </div>
      </div>
      <div style="background:#faf9fe;padding:12px 20px;text-align:center;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">${PROGRAM_NAME} — 31 Octobre 2026</p>
      </div>
    </div>
  </div>`;

  return sendEmail({
    to: [{ email: params.email, name: `${params.prenom} ${params.nom}` }],
    subject: `Tes accès administrateur - ${PROGRAM_NAME}`,
    htmlContent,
  });
}

/** Email de confirmation envoyé au participant qui vient de s'inscrire. */
export async function sendParticipantConfirmationEmail(data: {
  prenom: string;
  nom: string;
  email: string;
  agape: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const inscriptionUrl = `${getAppBaseUrl()}/inscription`;

  const htmlContent = `
  <div style="background:#f6f5fb;padding:16px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #eceafc;">
      <div style="background:linear-gradient(135deg,#5b21b6,#7c3aed);padding:26px 20px;text-align:center;">
        <h1 style="color:#ffffff;font-size:19px;margin:0 0 2px;">${PROGRAM_NAME}</h1>
        <p style="color:#e9d5ff;font-size:12px;margin:0;">Inscription confirmée</p>
      </div>
      <div style="padding:22px;">
        <p style="color:#111827;font-size:15px;margin:0 0 10px;">Bonjour ${data.prenom},</p>
        <p style="color:#374151;font-size:14px;margin:0 0 14px;">
          Merci pour ton inscription à <strong>${PROGRAM_NAME}</strong> ! Nous avons
          hâte de t'accueillir le <strong>${PROGRAM_DATE_LABEL}</strong> pour ce
          grand moment d'adoration.
        </p>
        <div style="background:#f4f1fb;border:1px solid #e6e0f5;border-radius:10px;padding:14px 16px;margin:14px 0;">
          <p style="color:#5b21b6;font-size:14px;font-style:italic;margin:0;">
            « Que tout ce qui respire loue l'Éternel ! »
          </p>
          <p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">Psaume 150.6</p>
        </div>
        ${
          data.agape
            ? `<p style="color:#374151;font-size:14px;margin:0 0 6px;">Tu as indiqué être disponible pour <strong>l'agapé</strong> après le programme — un repas de communion fraternelle. Merci, on compte sur toi !</p>`
            : ""
        }
        <p style="color:#374151;font-size:14px;margin:14px 0 0;">
          Prépare ton cœur dès aujourd'hui. Nous prions pour toi et t'attendons
          avec joie.
        </p>
      </div>
      <div style="background:#faf9fe;padding:12px 20px;text-align:center;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">${PROGRAM_NAME} — ${PROGRAM_DATE_LABEL}</p>
      </div>
    </div>
  </div>`;

  return sendEmail({
    to: [{ email: data.email, name: `${data.prenom} ${data.nom}` }],
    subject: `Ton inscription est confirmée — ${PROGRAM_NAME}`,
    htmlContent,
  });
}

/**
 * Notifie les administrateurs d'une nouvelle inscription.
 * Destinataires = tous les emails passés (admins de la base) + ADMIN_EMAILS,
 * dédoublonnés.
 */
export async function sendNewRegistrationEmail(
  data: RegistrationInput,
  extraRecipients: string[] = []
): Promise<{ ok: boolean; error?: string }> {
  const envEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const adminEmails = Array.from(
    new Set(
      [...envEmails, ...extraRecipients]
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (adminEmails.length === 0) {
    return { ok: false, error: "Aucun destinataire administrateur" };
  }

  const nouveauxUrl = `${getAppBaseUrl()}/admin/nouveaux`;

  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:8px 12px;color:#6b7280;font-size:14px;border-bottom:1px solid #f1f0f5;">${label}</td>
       <td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #f1f0f5;">${value || "—"}</td>
     </tr>`;

  const htmlContent = `
  <div style="background:#f6f5fb;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eceafc;">
      <div style="background:linear-gradient(135deg,#5b21b6,#7c3aed);padding:28px 24px;text-align:center;">
        <h1 style="color:#ffffff;font-size:20px;margin:0 0 2px;">${PROGRAM_NAME}</h1>
        <p style="color:#e9d5ff;font-size:13px;margin:0;">Nouvelle inscription reçue</p>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;font-size:15px;margin-top:0;">Une nouvelle personne vient de s'inscrire au programme d'adoration :</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #f1f0f5;border-radius:10px;overflow:hidden;">
          ${row("Nom", data.nom)}
          ${row("Prénom", data.prenom)}
          ${row("Téléphone", data.telephone)}
          ${row("WhatsApp", data.whatsapp)}
          ${row("Ville", data.ville)}
          ${row("Quartier", data.quartier)}
          ${row("Agapé", data.agape ? "Oui" : "Non")}
        </table>
        <div style="text-align:center;margin-top:28px;">
          <a href="${nouveauxUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:10px;">
            Voir les nouveaux inscrits
          </a>
        </div>
      </div>
      <div style="background:#faf9fe;padding:16px 24px;text-align:center;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">${PROGRAM_NAME} — Programme du 31 Octobre 2026</p>
      </div>
    </div>
  </div>`;

  return sendEmail({
    to: adminEmails.map((email) => ({ email })),
    subject: `Nouvelle inscription - ${PROGRAM_NAME}`,
    htmlContent,
  });
}
