import React from 'react'


const plans = [
{ name: 'Essentiel', price: '5 000 Da / Mo', bullets: ['QCM', 'Suivi basique'] },
{ name: 'Avancé', price: '10 000 Da / Mo', bullets: ['Tout Essentiel', 'Statistiques'] },
{ name: 'Spécial', price: '15 000 Da / Mo', bullets: ['Tout Avancé', 'Suivi personnalisé'], popular: true },
{ name: 'Complet', price: '20 000 Da / Mo', bullets: ['Tout Spécial', 'Coaching'] }
]


const Pricing: React.FC = () => (
<section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
<div className="text-center">
<h3 className="text-3xl font-bold">Choisissez votre formule de révision</h3>
<p className="mt-2 text-gray-600">Adaptez votre apprentissage à votre rythme.</p>
</div>


<div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
{plans.map((p) => (
<div key={p.name} className={`p-6 rounded-2xl shadow ${p.popular ? 'border-2 border-primary scale-105' : ''}`}>
<h4 className="font-semibold">{p.name}</h4>
<div className="mt-2 text-2xl font-bold">{p.price}</div>
<ul className="mt-4 space-y-2 text-sm text-gray-600">
{p.bullets.map((b) => <li key={b}>• {b}</li>)}
</ul>
<button className="mt-6 w-full py-3 rounded-full bg-primary text-white">Commencer maintenant</button>
</div>
))}
</div>
</section>
)


export default React.memo(Pricing)