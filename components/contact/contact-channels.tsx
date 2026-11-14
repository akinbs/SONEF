import {
  contactInfo,
  getSocialProfiles,
  httpsUrl,
  mailtoHref,
  telHref,
  whatsappHref,
  type ContactPerson,
} from "@/content/contact";
import { ContactIcon, type ContactIconName } from "./contact-icon";
import styles from "./contact-channels.module.css";

/*
 * İletişim sayfasının üç kart grubu (Blok 08). Hepsi `content/contact.ts` içindeki tek kaynaktan
 * okur ve aynı kart dilini (beyaz yüzey, #D5CFC5 kenarlık, 20px köşe, hafif gölge) ve aynı iki
 * sütunlu ızgarayı kullanır; böylece kişi kartları, kanallar ve adres–saat panelleri aynı dikey
 * çizgilere oturur.
 */

const NEW_TAB = " (yeni sekmede açılır)";

type ActionProps = {
  href: string;
  /** Dekoratif ikon; görünen metin her zaman vardır. */
  icon?: ContactIconName;
  /** Görünen kısa metin, ör. "Telefonla arayın". */
  label: string;
  /** Erişilebilir adın görünmeyen devamı: kime ya da nereye ulaşıldığı. */
  context?: string;
  external?: boolean;
};

/** İkon + metin bağlantısı. Erişilebilir ad görünen metinle başlar (label-in-name). */
function Action({ href, icon, label, context, external = false }: ActionProps) {
  return (
    <a
      href={href}
      className={styles.action}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {icon ? <ContactIcon name={icon} className={styles.actionIcon} /> : null}
      <span>
        {label}
        {context || external ? (
          <span className="visually-hidden">
            {context ? `: ${context}` : ""}
            {external ? NEW_TAB : ""}
          </span>
        ) : null}
      </span>
      {external ? (
        <span className={styles.external} aria-hidden="true">
          ↗
        </span>
      ) : null}
    </a>
  );
}

function PersonCard({ person }: { person: ContactPerson }) {
  const tel = telHref(person.phone);
  const whatsapp = person.whatsapp ? whatsappHref(person.phone) : undefined;
  const headingId = `kisi-${person.id}`;
  return (
    <li className={styles.cell}>
      <article className={styles.card} aria-labelledby={headingId} data-tone="card">
        <h3 id={headingId} className={styles.cardTitle}>
          {person.name}
        </h3>
        <p className={styles.phone}>
          <span className="visually-hidden">Telefon: </span>
          {person.phone.display}
        </p>
        <div className={styles.actions}>
          {tel ? (
            <Action href={tel} icon="phone" label="Telefonla arayın" context={`${person.name}, ${person.phone.display}`} />
          ) : null}
          {whatsapp ? (
            <Action
              href={whatsapp}
              icon="whatsapp"
              label="WhatsApp’tan yazın"
              context={person.name}
              external
            />
          ) : null}
        </div>
      </article>
    </li>
  );
}

/** "Doğrudan iletişim": kişi başına ad, görünen numara ve arama/WhatsApp bağlantıları. */
export function ContactPeople() {
  return (
    <ul className={`${styles.grid} ${styles.aligned}`}>
      {contactInfo.people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </ul>
  );
}

/** E-posta ve sosyal profiller (şu an Instagram); yeni profil `contactInfo.social`a eklenince kart çıkar. */
export function ContactChannelCards() {
  const mailto = mailtoHref(contactInfo.email);
  const profiles = getSocialProfiles();
  return (
    <ul className={`${styles.grid} ${styles.aligned}`}>
      {mailto ? (
        <li className={styles.cell}>
          <article className={styles.card} aria-labelledby="kanal-eposta" data-tone="card">
            <h3 id="kanal-eposta" className={styles.cardTitle}>
              <ContactIcon name="mail" className={styles.titleIcon} />
              E-posta
            </h3>
            <p className={styles.channelValue}>{contactInfo.email}</p>
            <div className={styles.actions}>
              <Action href={mailto} icon="mail" label="E-posta gönderin" context={contactInfo.email} />
            </div>
          </article>
        </li>
      ) : null}
      {profiles.map((profile) => {
        const headingId = `kanal-${profile.platform}`;
        return (
          <li key={profile.platform} className={styles.cell}>
            <article className={styles.card} aria-labelledby={headingId} data-tone="card">
              <h3 id={headingId} className={styles.cardTitle}>
                {profile.platform === "instagram" ? <ContactIcon name="instagram" className={styles.titleIcon} /> : null}
                {profile.label}
              </h3>
              <p className={styles.channelValue}>{profile.handle}</p>
              <div className={styles.actions}>
                <Action
                  href={profile.url}
                  icon={profile.platform === "instagram" ? "instagram" : undefined}
                  label={`${profile.label} profilimizi açın`}
                  external
                />
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

/** Adres (harita bağlantısıyla) ve çalışma saatleri panelleri. */
export function ContactInfoPanels() {
  const { address, workingHours } = contactInfo;
  const mapUrl = httpsUrl(address.mapUrl);
  return (
    <ul className={`${styles.grid} ${styles.panels}`}>
      <li className={styles.cell}>
        <section className={styles.card} aria-labelledby="adresimiz" data-tone="card">
          <h3 id="adresimiz" className={styles.cardTitle}>
            <ContactIcon name="map" className={styles.titleIcon} />
            Adresimiz
          </h3>
          <address className={styles.address}>
            {address.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          {mapUrl ? (
            <div className={styles.actions}>
              <a href={mapUrl} className={styles.textLink} target="_blank" rel="noopener noreferrer">
                Google Haritalar’da aç
                <span className={styles.external} aria-hidden="true">
                  ↗
                </span>
                <span className="visually-hidden">{NEW_TAB}</span>
              </a>
            </div>
          ) : null}
        </section>
      </li>
      <li className={styles.cell}>
        <section className={styles.card} aria-labelledby="calisma-saatlerimiz" data-tone="card">
          <h3 id="calisma-saatlerimiz" className={styles.cardTitle}>
            <ContactIcon name="clock" className={styles.titleIcon} />
            Çalışma saatlerimiz
          </h3>
          <dl className={styles.hours}>
            {workingHours.map((row) => (
              <div key={row.days} className={styles.hoursRow}>
                <dt>{row.days}</dt>
                <dd>{row.hours}</dd>
              </div>
            ))}
          </dl>
        </section>
      </li>
    </ul>
  );
}
