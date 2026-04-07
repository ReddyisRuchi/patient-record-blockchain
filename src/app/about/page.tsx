import Navbar from "@/components/Navbar";

const team = [
  { name: "P. Phani Prasad",          role: "Project Guide"  },
  { name: "Anugu Ruchi Reddy",         role: "Team Lead" },
  { name: "Aditi Joshi",               role: "Member" },
  { name: "Kondru Raja Nakshathra",    role: "Member" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-900">

        {/* Hero */}
        <section className="py-24 px-4 text-center fade-in fade-in-1">
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
            BE 4th Year · Sem 8 · CSE A
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            About This Project
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">
            A blockchain-based patient record management system built to ensure
            data integrity, role-based access, and tamper-proof medical history.
          </p>
        </section>

        {/* Divider */}
        <div className="container-max">
          <hr className="border-slate-200 dark:border-slate-700" />
        </div>

        {/* Team */}
        <section className="py-20 px-4">
          <div className="container-max">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-12 fade-in fade-in-2">
              The Team
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <div
                  key={member.name}
                  className={`card flex flex-col items-center text-center fade-in fade-in-${i + 3}`}
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-white dark:text-slate-900">
                      {initials(member.name)}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-900 dark:text-white">
                    {member.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

    </>
  );
}
