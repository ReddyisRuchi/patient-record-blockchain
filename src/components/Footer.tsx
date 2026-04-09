import Link from "next/link";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

const team = [
  { name: "P. Phani Prasad",       role: "Project Guide",  roll: null },
  { name: "Anugu Ruchi Reddy",      role: "Member",         roll: "2451-22-733-037" },
  { name: "Aditi Joshi",            role: "Member",         roll: "2451-22-733-041" },
  { name: "Kondru Raja Nakshathra", role: "Member",         roll: "2451-22-733-025" },
];

export default function Footer() {
  return (
    <footer className="bg-black text-slate-300 py-12 mt-20">
      <div className="container-max">

        {/* Team grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {team.map((member) => (
            <div key={member.name} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{initials(member.name)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{member.role}</p>
                {member.roll && <p className="text-xs text-neutral-600 mt-0.5 font-mono">{member.roll}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-900 pt-6 flex items-center justify-between">
          <p className="text-xs text-neutral-600">BE 4th Year · Sem 8 · CSE A</p>
          <Link href="/about" className="text-xs text-neutral-500 hover:text-white transition-colors">
            About Us
          </Link>
        </div>

      </div>
    </footer>
  );
}
