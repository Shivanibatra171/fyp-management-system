const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { PreviousFYP } = require('./src/models');

function classifyProject(p) {
  const text = `${p.title} ${p.abstract} ${(p.technologies || []).join(' ')}`.toLowerCase();

  // Blockchain
  if (text.includes('blockchain') || text.includes('solidity') || text.includes('ethereum') || text.includes('hyperledger') || text.includes('polygon') || text.includes('web3')) {
    return 'Blockchain & FinTech';
  }

  // Cybersecurity
  if (text.includes('cybersecurity') || text.includes('vulnerability') || text.includes('zero-trust') || text.includes('ztna') || text.includes('honeypot') || text.includes('intrusion detection') || text.includes('ids') || text.includes('scada')) {
    return 'Cybersecurity & Networks';
  }

  // Computer Vision
  if (text.includes('vision') || text.includes('face recognition') || text.includes('yolo') || text.includes('defect detection') || text.includes('segmentation') || text.includes('opencv') || text.includes('surveillance') || text.includes('bubble sheet') || text.includes('omr')) {
    return 'Computer Vision';
  }

  // Bioinformatics & Healthcare
  if (text.includes('mri') || text.includes('tumor') || text.includes('cardiac') || text.includes('ecg') || text.includes('aneurysm') || text.includes('retinal') || text.includes('genetics') || text.includes('dental caries') || text.includes('bioinformatics')) {
    return 'Bioinformatics & Healthcare';
  }

  // IoT & Embedded Systems & Robotics
  if (text.includes('iot') || text.includes('esp32') || text.includes('arduino') || text.includes('raspberry pi') || text.includes('lorawan') || text.includes('sensor') || text.includes('smart electric') || text.includes('wheelchair') || text.includes('drone') || text.includes('robotic') || text.includes('wearable') || text.includes('stm32') || text.includes('bci')) {
    return 'IoT & Embedded Systems';
  }

  // Artificial Intelligence / NLP / Machine Learning
  if (text.includes('artificial intelligence') || text.includes('deep learning') || text.includes('machine learning') || text.includes('nlp') || text.includes('pytorch') || text.includes('tensorflow') || text.includes('whisper') || text.includes('rag') || text.includes('langchain') || text.includes('transformer') || text.includes('deepfake') || text.includes('sentiment') || text.includes('ai-') || text.includes('ai based') || text.includes('agentic')) {
    return 'Artificial Intelligence';
  }

  // Web & Cloud Computing
  return 'Web & Cloud Computing';
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const all = await PreviousFYP.find({});
  console.log(`Found ${all.length} projects`);

  const domainCounts = {};
  for (const p of all) {
    const newDomain = classifyProject(p);
    domainCounts[newDomain] = (domainCounts[newDomain] || 0) + 1;
    await PreviousFYP.updateOne({ _id: p._id }, { $set: { domain: newDomain } });
  }

  console.log('Updated all project domains! Breakdown:');
  console.log(JSON.stringify(domainCounts, null, 2));

  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
