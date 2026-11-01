import React from 'react';

const SectionHeading = ({ eyebrow, title, sub, center = false, as: Heading = 'h2' }) => (
  <div className={`section-heading ${center ? 'text-center' : ''}`}>
    {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
    <Heading className="section-title text-ivory-100">{title}</Heading>
    {sub && (
      <p className={`section-description text-ivory-400 ${center ? 'mx-auto' : ''}`}>{sub}</p>
    )}
    <div className={`gold-rule w-24 mt-6 ${center ? 'mx-auto' : ''}`} />
  </div>
);

export default SectionHeading;
