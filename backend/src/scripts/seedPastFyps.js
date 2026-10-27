const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { PreviousFYP } = require('../models');

// Extract past FYPs list or reference
const samplePastFyps = [
  {
    title: 'Real-Time Multi-Object Detection and Lane Tracking for Autonomous Vehicles',
    abstract: 'An intelligent computer vision system leveraging YOLOv8, PyTorch, and OpenCV to perform real-time obstacle detection, pedestrian tracking, and lane departure alerts for driver assistance.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Hamza Tariq', 'Bilal Khan'],
    technologies: ['PyTorch', 'Python', 'OpenCV', 'YOLOv8', 'CUDA'],
    grade: 'A+',
  },
  {
    title: 'Smart Campus Surveillance and Face Recognition Attendance Portal',
    abstract: 'An automated classroom attendance and perimeter security pipeline using DeepFace, OpenCV, and React. Integrates webcam feeds and vector embeddings to mark student attendance.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Fahad Siddiqui',
    studentNames: ['Sara Noor', 'Usman Ghani'],
    technologies: ['React', 'Python', 'OpenCV', 'TensorFlow', 'FastAPI'],
    grade: 'A',
  },
  {
    title: 'Automated Medical X-Ray Anomaly Detection using Convolutional Networks',
    abstract: 'A diagnostic decision-support web application that analyzes chest radiography images to detect pneumonia, tuberculosis, and COVID-19 using DenseNet-121 and PyTorch with a React clinician dashboard.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Tariq Mahmood',
    studentNames: ['Ayesha Malik', 'Zainab Fatima'],
    technologies: ['PyTorch', 'React', 'Flask', 'OpenCV', 'TorchVision'],
    grade: 'A+',
  },
  {
    title: 'Deep Learning Brain MRI Tumor Segmentation and Volumetric Analysis',
    abstract: 'Automated 3D U-Net segmentation pipeline on BraTS dataset extracting glioma tumor boundaries and calculating volumetric growth for neurosurgical planning.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Asif Nawaz',
    studentNames: ['Sarmad Ali', 'Nida Fatima'],
    technologies: ['PyTorch', '3D U-Net', 'SimpleITK', 'Python', 'Streamlit'],
    grade: 'A+',
  },
  {
    title: 'Real-Time Driver Drowsiness and Distraction Warning System',
    abstract: 'An edge vision device monitoring eye aspect ratio (EAR) and facial landmarks via MediaPipe and IR camera to trigger acoustic alarms during microsleep events.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Sana Mir',
    studentNames: ['Waqas Ahmed', 'Faizan Ali'],
    technologies: ['OpenCV', 'MediaPipe', 'Raspberry Pi', 'Python', 'GPIO'],
    grade: 'A',
  },
  {
    title: 'Automated Industrial Surface Defect Detection using Thermal and RGB Vision',
    abstract: 'Machine vision inspection pipeline deploying YOLOv7 on conveyor belt manufacturing lines to identify micro-cracks in metallic casting with sub-millimeter precision.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Zafar Iqbal',
    studentNames: ['Rashid Minhas', 'Daniyal Khan'],
    technologies: ['PyTorch', 'OpenCV', 'Industrial Camera SDK', 'C++', 'Qt'],
    grade: 'A+',
  },
  {
    title: 'IoT-Enabled Smart Agriculture and Crop Disease Diagnosis System',
    abstract: 'An end-to-end precision farming system combining ESP32 soil sensors with mobile cameras. Uses MobileNetV3 to diagnose leaf rust and blight in agricultural crops.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Ali Raza', 'Omer Farooq'],
    technologies: ['Python', 'TensorFlow', 'React Native', 'ESP32', 'MQTT'],
    grade: 'A',
  },
  {
    title: 'IoT-Based Industrial Predictive Motor Maintenance and Vibration Analysis',
    abstract: 'An industrial IoT solution integrating 3-axis vibration and thermal sensors on three-phase induction motors with TinyML anomaly detection on edge microcontrollers.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Bilal Khan', 'Ahmed Raza'],
    technologies: ['ESP32', 'C++', 'Python', 'MQTT', 'InfluxDB', 'React'],
    grade: 'A+',
  },
  {
    title: 'Autonomous Warehouse Mobile Robot Navigation with LiDAR SLAM',
    abstract: 'A robotic platform using ROS2, Hector SLAM, and obstacle avoidance algorithms for indoor autonomous guided vehicles (AGV) in industrial manufacturing facilities.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Amna Farooq',
    studentNames: ['Muhammad Talha', 'Saad Ahmed'],
    technologies: ['ROS2', 'Python', 'C++', 'LiDAR', 'OpenCV'],
    grade: 'A',
  },
  {
    title: 'Intelligent Speech-to-Text and Sentiment Analyzer for Regional Dialects',
    abstract: 'A multimodal acoustic model utilizing OpenAI Whisper fine-tuned on South Asian language corpora to transcribe audio lectures and perform real-time sentiment scoring.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Fahad Siddiqui',
    studentNames: ['Hina Riaz', 'Kashif Ali'],
    technologies: ['PyTorch', 'HuggingFace', 'Python', 'React', 'Node.js'],
    grade: 'A+',
  },
  {
    title: 'Decentralized Academic Degree Verification System using Ethereum Blockchain',
    abstract: 'A tamper-proof credential issuance and verification platform using Solidity smart contracts and IPFS to prevent forgery of higher education degrees and transcripts.',
    domain: 'Computer Science',
    year: 2023,
    supervisorName: 'Dr. Tariq Mahmood',
    studentNames: ['Daniyal Qureshi', 'Sarmad Ali'],
    technologies: ['Solidity', 'Ethereum', 'Web3.js', 'React', 'Node.js'],
    grade: 'A',
  },
  {
    title: 'Network Intrusion Detection System using Autoencoders and Random Forest',
    abstract: 'A real-time network traffic anomaly detection engine trained on NSL-KDD and CICIDS2017 datasets to block zero-day DDoS, brute force, and port scanning attacks.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Amna Farooq',
    studentNames: ['Asad Ullah', 'Noman Bashir'],
    technologies: ['Python', 'Scikit-Learn', 'Keras', 'Wireshark', 'Kafka'],
    grade: 'A',
  },
  {
    title: 'Predictive Solar Energy Forecasting and Microgrid Power Distribution',
    abstract: 'A machine learning pipeline utilizing Bidirectional LSTM networks to forecast solar photovoltaic power generation and balance smart grid battery storage in real-time.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Farhan Siddiqui', 'Haris Sheikh'],
    technologies: ['TensorFlow', 'Python', 'InfluxDB', 'Grafana', 'Pandas'],
    grade: 'A',
  },
  {
    title: 'High-Throughput University Course Registration Portal with Distributed Caching',
    abstract: 'An enterprise web portal engineered to handle massive concurrent traffic spikes during semester enrollment utilizing Redis in-memory clusters and Node.js microservices.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Amna Farooq',
    studentNames: ['Zeeshan Haider', 'Bilal Nazeer'],
    technologies: ['Node.js', 'Express', 'Redis', 'MongoDB', 'React'],
    grade: 'A+',
  },
  {
    title: 'Sign Language Translation Glove with Flex Sensors and Neural Networks',
    abstract: 'A wearable assistive glove equipped with flex sensors and an MPU6050 accelerometer connected to an onboard microcontroller that translates sign gestures into spoken English audio.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Ahmed Mustafa', 'Waleed Khan'],
    technologies: ['Arduino', 'Python', 'TensorFlow Lite', 'C++', 'Bluetooth'],
    grade: 'A',
  },
  {
    title: 'Cloud-Native Microservices Observability and Automated Fault Recovery Engine',
    abstract: 'A cloud orchestration platform that continuously monitors Kubernetes container metrics using Prometheus and automatically deploys rolling rollbacks on service latency anomalies.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Fahad Siddiqui',
    studentNames: ['Shahid Afridi', 'Mustafa Kamal'],
    technologies: ['Docker', 'Kubernetes', 'Prometheus', 'Go', 'React'],
    grade: 'A',
  },
];

async function seedPastFyps() {
  console.log('[Seed FYPs] Connecting to mongodb://127.0.0.1:27017/fyp_management...');
  await mongoose.connect('mongodb://127.0.0.1:27017/fyp_management');

  const count = await PreviousFYP.countDocuments();
  console.log(`[Seed FYPs] Total past FYPs in database: ${count}`);

  await mongoose.disconnect();
  console.log('[Seed FYPs] Done.');
  process.exit(0);
}

seedPastFyps().catch((e) => {
  console.error('[Seed FYPs Error]:', e);
  process.exit(1);
});
