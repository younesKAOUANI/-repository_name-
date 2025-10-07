'use client';
import React from 'react';
import { motion } from 'framer-motion';


const plans = [
{ name: 'Essentiel', price: '5 000 Da / Mo', bullets: ['QCM', 'Suivi basique'] },
{ name: 'Avancé', price: '10 000 Da / Mo', bullets: ['Tout Essentiel', 'Statistiques'] },
{ name: 'Spécial', price: '15 000 Da / Mo', bullets: ['Tout Avancé', 'Suivi personnalisé'], popular: true },
{ name: 'Complet', price: '20 000 Da / Mo', bullets: ['Tout Spécial', 'Coaching'] }
]


const Pricing: React.FC = () => (
<motion.section 
  id="pricing" 
  className="max-w-6xl mx-auto px-6 py-16"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
  viewport={{ once: true }}
>
<motion.div 
  className="text-center"
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  viewport={{ once: true }}
>
<motion.h3 
  className="text-3xl font-bold"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.4 }}
  viewport={{ once: true }}
>
  Choisissez votre formule de révision
</motion.h3>
<motion.p 
  className="mt-2 text-gray-600"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.6 }}
  viewport={{ once: true }}
>
  Adaptez votre apprentissage à votre rythme.
</motion.p>
</motion.div>



<motion.div 
  className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.8 }}
  viewport={{ once: true }}
>
{plans.map((p, index) => (
<motion.div 
  key={p.name} 
  className={`p-6 rounded-2xl shadow ${p.popular ? 'border-2 border-primary scale-105' : ''}`}
  initial={{ opacity: 0, y: 30, scale: 0.9 }}
  whileInView={{ opacity: 1, y: 0, scale: p.popular ? 1.05 : 1 }}
  transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
  viewport={{ once: true }}
  whileHover={{ scale: p.popular ? 1.08 : 1.03, y: -5 }}
>
<motion.h4 
  className="font-semibold"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
  viewport={{ once: true }}
>
  {p.name}
</motion.h4>
<motion.div 
  className="mt-2 text-2xl font-bold"
  initial={{ opacity: 0, scale: 0.8 }}
  whileInView={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
  viewport={{ once: true }}
>
  {p.price}
</motion.div>
<motion.ul 
  className="mt-4 space-y-2 text-sm text-gray-600"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
  viewport={{ once: true }}
>
{p.bullets.map((b, bulletIndex) => 
<motion.li 
  key={b}
  initial={{ opacity: 0, x: -10 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3, delay: 1.5 + index * 0.1 + bulletIndex * 0.05 }}
  viewport={{ once: true }}
>
  • {b}
</motion.li>
)}
</motion.ul>
<motion.button 
  className="mt-6 w-full py-3 rounded-full bg-primary text-white"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
  viewport={{ once: true }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Commencer maintenant
</motion.button>
</motion.div>
))}
</motion.div>
</motion.section>
)


export default React.memo(Pricing)