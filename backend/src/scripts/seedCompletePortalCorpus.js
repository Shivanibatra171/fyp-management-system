const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const {
  User,
  Proposal,
  Project,
  Marks,
  ProgressUpdate,
  Feedback,
  PreviousFYP,
} = require('../models');

// 38 COMPREHENSIVE HISTORICAL FYPS SPANNING ALL COMPUTER SYSTEM & SOFTWARE DOMAINS
const comprehensivePastFyps = [
  // 1. COMPUTER VISION & AUTONOMOUS SYSTEMS
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

  // 2. IOT, HARDWARE & EMBEDDED SYSTEMS
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
    title: 'Smart Water Quality Monitoring and Contaminant Alert Network',
    abstract: 'Distributed sensor buoys measuring pH, turbidity, dissolved oxygen, and conductivity with LoRaWAN wireless transmission to municipal water authority dashboard.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Rabia Basri',
    studentNames: ['Taha Naveed', 'Saba Qureshi'],
    technologies: ['LoRaWAN', 'ESP32', 'Node.js', 'InfluxDB', 'Grafana'],
    grade: 'A',
  },
  {
    title: 'Smart Electric Metering Infrastructure with Automated Theft Detection',
    abstract: 'IoT smart energy meter featuring ADE7758 power metering IC and GSM module, computing phase current discrepancy to identify illegal electricity tapping.',
    domain: 'Computer System Engineering',
    year: 2022,
    supervisorName: 'Dr. Asif Nawaz',
    studentNames: ['Junaid Jamshed', 'Faraz Ali'],
    technologies: ['STM32', 'GSM/GPRS', 'C++', 'React', 'Node.js'],
    grade: 'A',
  },
  {
    title: 'Wearable ECG Cardiac Arrhythmia Monitor with Cellular Emergency Alert',
    abstract: 'A continuous 3-lead Holter patch capturing biosignals and running lightweight 1D-CNN on Nordic nRF52840 SoC to detect ventricular tachycardia and transmit GPS coordinates.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Fahad Siddiqui',
    studentNames: ['Hafsa Bano', 'Rehan Sheikh'],
    technologies: ['BLE', 'nRF52840', 'TensorFlow Lite', 'Flutter', 'Firebase'],
    grade: 'A+',
  },
  {
    title: 'Automated Solar Panel Cleaning and Sun Tracking Mechanism',
    abstract: 'Dual-axis servo sun tracking controller coupled with wiper robot and dust optical sensors to maximize photovoltaic generation efficiency by 28 percent.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Zafar Iqbal',
    studentNames: ['Adeel Tariq', 'Mohsin Raza'],
    technologies: ['Arduino', 'LDR Sensors', 'Stepper Motors', 'C++', 'Blynk'],
    grade: 'B+',
  },

  // 3. ROBOTICS & CONTROL SYSTEMS
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
    title: 'Assistive Smart Wheelchair with Eye-Gaze Tracking and Ultrasonic Obstacle Avoidance',
    abstract: 'A hands-free motorized mobility solution integrating an eye-tracking infrared camera with an ultrasonic sensor grid and Raspberry Pi 5 to guide quadriplegic patients safely.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Sana Mir',
    studentNames: ['Hina Riaz', 'Zubair Shah'],
    technologies: ['Raspberry Pi', 'Python', 'OpenCV', 'TensorFlow Lite', 'Arduino'],
    grade: 'A+',
  },
  {
    title: '6-Degree-of-Freedom Robotic Manipulator with Inverse Kinematics Vision Pick-and-Place',
    abstract: 'Custom robotic arm driven by harmonic stepper motors and ROS MoveIt motion planning, incorporating eye-in-hand RGB-D camera to sort parcels on conveyer lines.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Asif Nawaz',
    studentNames: ['Khurram Shahzad', 'Umair Farooq'],
    technologies: ['ROS2', 'MoveIt', 'OpenCV', 'Python', '3D Printing'],
    grade: 'A+',
  },
  {
    title: 'Autonomous Hexacopter Drone for Search and Rescue in Disaster Zones',
    abstract: 'PX4 autopilot drone equipped with FLIR thermal imaging, GPS waypoint navigation, and onboard human detection running on Jetson Xavier NX.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Zafar Iqbal',
    studentNames: ['Arham Khan', 'Zeeshan Akbar'],
    technologies: ['PX4', 'Jetson NX', 'YOLOv5', 'ROS2', 'Python'],
    grade: 'A',
  },
  {
    title: 'Non-Invasive Brain-Computer Interface (BCI) for Prosthetic Hand Control',
    abstract: 'EEG headset processing motor imagery brain waves via continuous wavelet transform and SVM classifier to actuate bionic 3D printed finger servomotors.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Zafar Iqbal',
    studentNames: ['Babar Azam', 'Mahnoor Shah'],
    technologies: ['OpenBCI', 'Python', 'SciPy', 'Arduino', 'C++'],
    grade: 'A+',
  },

  // 4. NATURAL LANGUAGE PROCESSING & SPEECH
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
    title: 'Automated Urdu Document Optical Character Recognition and NLP Translation',
    abstract: 'A deep learning OCR pipeline using CRNN and CTC loss for recognizing Nastaliq-script handwritten Urdu documents, coupled with an mBART model for syntactic translation into English.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Fahad Siddiqui',
    studentNames: ['Zainab Fatima', 'Mustafa Kamal'],
    technologies: ['PyTorch', 'FastAPI', 'HuggingFace', 'Python', 'React'],
    grade: 'A',
  },
  {
    title: 'Legal Contract Summarization and Clause Extraction using Transformer Models',
    abstract: 'An NLP legal intelligence system extracting non-disclosure, indemnification, and liability clauses from bilingual PDF contracts using fine-tuned RoBERTa.',
    domain: 'Computer Science',
    year: 2023,
    supervisorName: 'Dr. Kashif Mehmood',
    studentNames: ['Haris Rauf', 'Saba Karim'],
    technologies: ['HuggingFace', 'PyTorch', 'FastAPI', 'React', 'TailwindCSS'],
    grade: 'A',
  },
  {
    title: 'Voice-Activated Multilingual AI Assistant for Rural Healthcare Consultations',
    abstract: 'An offline voice interface deployed on low-cost tablets enabling illiterate patients to articulate symptoms in Pashto, Sindhi, and Punjabi with clinical triage recommendations.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Imran Ali',
    studentNames: ['Danish Taimoor', 'Kinza Hashmi'],
    technologies: ['Whisper.cpp', 'Llama-3-8B', 'FastAPI', 'Flutter'],
    grade: 'A+',
  },

  // 5. BLOCKCHAIN & DECENTRALIZED LEDGERS
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
    title: 'Decentralized Peer-to-Peer Renewable Energy Trading Platform on Ethereum',
    abstract: 'A distributed solar energy accounting ledger utilizing Solidity smart contracts and automated smart meters to enable prosumers to trade surplus kilowatt-hours with neighbors.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Tariq Mahmood',
    studentNames: ['Sara Noor', 'Ali Raza'],
    technologies: ['Solidity', 'Ethereum', 'Web3.js', 'React', 'Node.js', 'Hardhat'],
    grade: 'A+',
  },
  {
    title: 'Decentralized Pharmaceutical Supply Chain Provenance Tracker',
    abstract: 'An anti-counterfeit drug provenance tracker storing serialization data on Polygon blockchain with dynamic QR code verification for pharmacies and consumer verification.',
    domain: 'Computer Science',
    year: 2023,
    supervisorName: 'Dr. Tariq Mahmood',
    studentNames: ['Daniyal Qureshi', 'Hamza Malik'],
    technologies: ['Polygon', 'Solidity', 'Node.js', 'React Native', 'MongoDB'],
    grade: 'A',
  },
  {
    title: 'Blockchain-Based Transparent Land Registry and Property Title Transfer Portal',
    abstract: 'Smart contracts automating deed transfer, stamp duty verification, and biometric land title escrow on Hyperledger Fabric consortium blockchain.',
    domain: 'Computer Science',
    year: 2023,
    supervisorName: 'Dr. Kashif Mehmood',
    studentNames: ['Arsalan Iftikhar', 'Rizwan Qasim'],
    technologies: ['Hyperledger Fabric', 'Go', 'Docker', 'React', 'Node.js'],
    grade: 'A',
  },

  // 6. CYBERSECURITY & NETWORK SYSTEMS
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
    title: 'SCADA Honeypot and Cyber Threat Intelligence for Critical Infrastructure',
    abstract: 'Emulated industrial Modbus and DNP3 industrial protocol honeypot capturing malicious payload commands and fingerprinting advanced persistent threat (APT) actors.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Zafar Iqbal',
    studentNames: ['Yasir Hussain', 'Farhan Siddiqui'],
    technologies: ['Python', 'Scapy', 'Elasticsearch', 'Kibana', 'Docker'],
    grade: 'A+',
  },
  {
    title: 'Automated Phishing URL and Zero-Day Web Threat Classifier using Transformer Embeddings',
    abstract: 'A browser extension inspecting lexical, WHOIS, and TLS certificate features using BERT embeddings to quarantine deceptive banking and enterprise phishing domains.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Kashif Mehmood',
    studentNames: ['Mehwish Hayat', 'Anum Saeed'],
    technologies: ['FastAPI', 'PyTorch', 'Chrome Extension API', 'React', 'Python'],
    grade: 'A',
  },
  {
    title: 'Zero-Trust Network Access (ZTNA) Controller with Contextual Device Fingerprinting',
    abstract: 'Microsegmentation proxy enforcing ephemeral WireGuard VPN tunnels based on continuous endpoint health checks and geofence risk scoring.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Asif Nawaz',
    studentNames: ['Babar Azam', 'Usman Tariq'],
    technologies: ['WireGuard', 'Go', 'Linux eBPF', 'React', 'PostgreSQL'],
    grade: 'A+',
  },

  // 7. SOFTWARE ENGINEERING & CLOUD ARCHITECTURE
  {
    title: 'Zero-Downtime Microservices Orchestration with Automated Canary Rollouts',
    abstract: 'A cloud-native DevOps platform integrating Prometheus real-time latency telemetry with custom Kubernetes controllers to trigger progressive automated canary deployments.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Amna Farooq',
    studentNames: ['Hamza Malik', 'Fahad Mustafa'],
    technologies: ['Kubernetes', 'Go', 'Docker', 'Prometheus', 'Helm', 'React'],
    grade: 'A+',
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
    title: 'Cross-Platform High-Performance Telemedicine Video Consultation Suite',
    abstract: 'WebRTC video consultation portal featuring end-to-end SRTP encryption, digital prescription signing, and real-time vital sign streaming from Bluetooth pulse oximeters.',
    domain: 'Software Engineering',
    year: 2023,
    supervisorName: 'Dr. Nadia Rehman',
    studentNames: ['Iqra Aziz', 'Alizeh Shah'],
    technologies: ['WebRTC', 'React', 'Node.js', 'Socket.io', 'MongoDB'],
    grade: 'A',
  },
  {
    title: 'Automated CI/CD Vulnerability Scanning and License Compliance Pipeline',
    abstract: 'DevSecOps CLI tool scanning git commits for leaked secrets, outdated dependencies (CVEs), and non-compliant open source licenses before merge requests.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Nadia Rehman',
    studentNames: ['Yasir Hussain', 'Shahzad Noor'],
    technologies: ['Go', 'Docker', 'GitHub Actions', 'SQLite', 'React'],
    grade: 'A',
  },

  // 8. DATA ENGINEERING & SMART ENERGY
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
    title: 'Real-Time Traffic Congestion Optimization using Graph Neural Networks',
    abstract: 'An adaptive urban traffic management platform that models city road networks as spatial-temporal graphs and predicts queue lengths using GNNs to optimize traffic signal timings in real-time.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Amna Farooq',
    studentNames: ['Omer Farooq', 'Farhan Siddiqui'],
    technologies: ['Python', 'PyTorch Geometric', 'SUMO Simulator', 'React', 'Node.js'],
    grade: 'A',
  },
  {
    title: 'Federated Learning Framework for Multi-Hospital Privacy-Preserving Cancer Diagnosis',
    abstract: 'A decentralized federated machine learning network allowing multiple medical centers to collaboratively train a DenseNet-121 classifier for histopathology images without sharing patient records.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Ayesha Malik', 'Fatima Jamil'],
    technologies: ['PyTorch', 'PySyft', 'OpenCV', 'React', 'FastAPI'],
    grade: 'A+',
  },
];

async function seedCompleteCorpus() {
  console.log('[Corpus Seed] Connecting to MongoDB on 127.0.0.1:27017/fyp_management...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyp_management');

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // 1. SUPERVISORS (12 Faculty Members)
  console.log('[Corpus Seed] Seeding 12 Faculty Supervisors...');
  const supervisorDefs = [
    {
      name: 'Dr. Khursheed Ahmed',
      email: 'dr.khursheed@university.edu',
      role: 'supervisor',
      department: 'Computer System Engineering',
      designation: 'Associate Professor',
      employeeId: 'EMP-012',
      phone: '+92-300-1110012',
    },
    {
      name: 'Dr. Tariq Mahmood',
      email: 'dr.tariq@university.edu',
      role: 'supervisor',
      department: 'Computer Science',
      designation: 'Professor',
      employeeId: 'EMP-015',
      phone: '+92-300-1110015',
    },
    {
      name: 'Dr. Amna Farooq',
      email: 'dr.amna@university.edu',
      role: 'supervisor',
      department: 'Software Engineering',
      designation: 'Associate Professor',
      employeeId: 'EMP-018',
      phone: '+92-300-1110018',
    },
    {
      name: 'Dr. Fahad Siddiqui',
      email: 'dr.fahad@university.edu',
      role: 'supervisor',
      department: 'Computer System Engineering',
      designation: 'Assistant Professor',
      employeeId: 'EMP-021',
      phone: '+92-300-1110021',
    },
    {
      name: 'Dr. Sana Mir',
      email: 'dr.sanamir@university.edu',
      role: 'supervisor',
      department: 'Computer System Engineering',
      designation: 'Assistant Professor',
      employeeId: 'EMP-025',
      phone: '+92-300-1110025',
    },
    {
      name: 'Dr. Asif Nawaz',
      email: 'dr.asif@university.edu',
      role: 'supervisor',
      department: 'Computer System Engineering',
      designation: 'Associate Professor',
      employeeId: 'EMP-028',
      phone: '+92-300-1110028',
    },
    {
      name: 'Dr. Zafar Iqbal',
      email: 'dr.zafar@university.edu',
      role: 'supervisor',
      department: 'Computer System Engineering',
      designation: 'Professor & Dean',
      employeeId: 'EMP-009',
      phone: '+92-300-1110009',
    },
    {
      name: 'Dr. Nadia Rehman',
      email: 'dr.nadia@university.edu',
      role: 'supervisor',
      department: 'Software Engineering',
      designation: 'Assistant Professor',
      employeeId: 'EMP-032',
      phone: '+92-300-1110032',
    },
    {
      name: 'Dr. Kashif Mehmood',
      email: 'dr.kashif@university.edu',
      role: 'supervisor',
      department: 'Computer Science',
      designation: 'Associate Professor',
      employeeId: 'EMP-035',
      phone: '+92-300-1110035',
    },
    {
      name: 'Dr. Rabia Basri',
      email: 'dr.rabia@university.edu',
      role: 'supervisor',
      department: 'Computer System Engineering',
      designation: 'Assistant Professor',
      employeeId: 'EMP-039',
      phone: '+92-300-1110039',
    },
    {
      name: 'Dr. Imran Ali',
      email: 'dr.imran@university.edu',
      role: 'supervisor',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      employeeId: 'EMP-042',
      phone: '+92-300-1110042',
    },
    {
      name: 'Engr. Madiha Javed',
      email: 'engr.madiha@university.edu',
      role: 'supervisor',
      department: 'Software Engineering',
      designation: 'Lecturer',
      employeeId: 'EMP-045',
      phone: '+92-300-1110045',
    },
  ];

  const supervisorsMap = {};
  for (const s of supervisorDefs) {
    let user = await User.findOne({ email: s.email });
    if (!user) {
      user = await User.create({
        ...s,
        password: hashedPassword,
        isActive: true,
      });
    } else {
      await User.updateOne({ email: s.email }, { $set: { ...s, password: hashedPassword, isActive: true } });
    }
    supervisorsMap[s.email] = user._id;
  }

  // 2. ADMIN USER
  console.log('[Corpus Seed] Ensuring Admin user...');
  let adminUser = await User.findOne({ email: 'admin@university.edu' });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'FYP Office Coordinator',
      email: 'admin@university.edu',
      password: hashedPassword,
      role: 'admin',
      department: 'Computer System Engineering',
      phone: '+92-300-1110000',
      isActive: true,
    });
  } else {
    await User.updateOne({ email: 'admin@university.edu' }, { $set: { password: hashedPassword, isActive: true } });
  }

  // 3. STUDENTS (37 active student candidates across CSE, CS, SE)
  console.log('[Corpus Seed] Seeding 37 Students...');
  const studentDefs = [
    { name: 'Ali Ahmed', email: 'student@university.edu', id: 'CSE-2023-01', dept: 'Computer System Engineering', sup: 'dr.khursheed@university.edu' },
    { name: 'Bilal Khan', email: 'student1@university.edu', id: 'CSE-2023-02', dept: 'Computer System Engineering', sup: 'dr.khursheed@university.edu' },
    { name: 'Sara Noor', email: 'student2@university.edu', id: 'CS-2023-03', dept: 'Computer Science', sup: 'dr.tariq@university.edu' },
    { name: 'Hamza Malik', email: 'student3@university.edu', id: 'SE-2023-04', dept: 'Software Engineering', sup: 'dr.amna@university.edu' },
    { name: 'Zainab Fatima', email: 'student4@university.edu', id: 'CSE-2023-05', dept: 'Computer System Engineering', sup: 'dr.fahad@university.edu' },
    { name: 'Usman Tariq', email: 'student5@university.edu', id: 'CS-2023-06', dept: 'Computer Science', sup: 'dr.tariq@university.edu' },
    { name: 'Ayesha Malik', email: 'student6@university.edu', id: 'CSE-2023-07', dept: 'Computer System Engineering', sup: 'dr.khursheed@university.edu' },
    { name: 'Omer Farooq', email: 'student7@university.edu', id: 'SE-2023-08', dept: 'Software Engineering', sup: 'dr.amna@university.edu' },
    { name: 'Hina Riaz', email: 'student8@university.edu', id: 'CSE-2023-09', dept: 'Computer System Engineering', sup: 'dr.sanamir@university.edu' },
    { name: 'Daniyal Qureshi', email: 'student9@university.edu', id: 'CS-2023-10', dept: 'Computer Science', sup: 'dr.tariq@university.edu' },
    { name: 'Maryam Nawaz', email: 'student10@university.edu', id: 'CSE-2023-11', dept: 'Computer System Engineering', sup: 'dr.asif@university.edu' },
    { name: 'Farhan Siddiqui', email: 'student11@university.edu', id: 'SE-2023-12', dept: 'Software Engineering', sup: 'dr.amna@university.edu' },
    { name: 'Teesha Kumari', email: 'student12@university.edu', id: 'CS-2023-13', dept: 'Computer Science', sup: 'dr.khursheed@university.edu' },
    { name: 'Ahmed Raza', email: 'student13@university.edu', id: 'CSE-2023-14', dept: 'Computer System Engineering', sup: 'dr.sanamir@university.edu' },
    { name: 'Zeeshan Haider', email: 'student14@university.edu', id: 'SE-2023-15', dept: 'Software Engineering', sup: 'dr.nadia@university.edu' },
    { name: 'Kashif Ali', email: 'student15@university.edu', id: 'CSE-2023-16', dept: 'Computer System Engineering', sup: 'dr.fahad@university.edu' },
    { name: 'Noman Bashir', email: 'student16@university.edu', id: 'CS-2023-17', dept: 'Computer Science', sup: 'dr.kashif@university.edu' },
    { name: 'Waleed Khan', email: 'student17@university.edu', id: 'CSE-2023-18', dept: 'Computer System Engineering', sup: 'dr.asif@university.edu' },
    { name: 'Saad Ahmed', email: 'student18@university.edu', id: 'SE-2023-19', dept: 'Software Engineering', sup: 'dr.amna@university.edu' },
    { name: 'Mustafa Kamal', email: 'student19@university.edu', id: 'CSE-2023-20', dept: 'Computer System Engineering', sup: 'dr.fahad@university.edu' },
    { name: 'Mahnoor Shah', email: 'student20@university.edu', id: 'CSE-2023-21', dept: 'Computer System Engineering', sup: 'dr.asif@university.edu' },
    { name: 'Babar Azam', email: 'student21@university.edu', id: 'CSE-2023-22', dept: 'Computer System Engineering', sup: 'dr.zafar@university.edu' },
    { name: 'Fatima Jamil', email: 'student22@university.edu', id: 'CSE-2023-23', dept: 'Computer System Engineering', sup: 'dr.asif@university.edu' },
    { name: 'Haris Rauf', email: 'student23@university.edu', id: 'CSE-2023-24', dept: 'Computer System Engineering', sup: 'dr.rabia@university.edu' },
    { name: 'Anum Saeed', email: 'student24@university.edu', id: 'CSE-2023-25', dept: 'Computer System Engineering', sup: 'dr.rabia@university.edu' },
    { name: 'Rizwan Qasim', email: 'student25@university.edu', id: 'CSE-2023-26', dept: 'Computer System Engineering', sup: 'dr.zafar@university.edu' },
    { name: 'Saba Karim', email: 'student26@university.edu', id: 'CS-2023-27', dept: 'Computer Science', sup: 'dr.kashif@university.edu' },
    { name: 'Danish Taimoor', email: 'student27@university.edu', id: 'CS-2023-28', dept: 'Computer Science', sup: 'dr.imran@university.edu' },
    { name: 'Mehwish Hayat', email: 'student28@university.edu', id: 'CS-2023-29', dept: 'Computer Science', sup: 'dr.kashif@university.edu' },
    { name: 'Arsalan Iftikhar', email: 'student29@university.edu', id: 'CS-2023-30', dept: 'Computer Science', sup: 'dr.imran@university.edu' },
    { name: 'Kinza Hashmi', email: 'student30@university.edu', id: 'CS-2023-31', dept: 'Computer Science', sup: 'dr.imran@university.edu' },
    { name: 'Fahad Mustafa', email: 'student31@university.edu', id: 'SE-2023-32', dept: 'Software Engineering', sup: 'dr.nadia@university.edu' },
    { name: 'Iqra Aziz', email: 'student32@university.edu', id: 'SE-2023-33', dept: 'Software Engineering', sup: 'dr.nadia@university.edu' },
    { name: 'Yasir Hussain', email: 'student33@university.edu', id: 'SE-2023-34', dept: 'Software Engineering', sup: 'engr.madiha@university.edu' },
    { name: 'Alizeh Shah', email: 'student34@university.edu', id: 'SE-2023-35', dept: 'Software Engineering', sup: 'dr.nadia@university.edu' },
    { name: 'Shahzad Noor', email: 'student35@university.edu', id: 'CSE-2023-36', dept: 'Computer System Engineering', sup: 'dr.rabia@university.edu' },
    { name: 'Nimra Khan', email: 'student36@university.edu', id: 'CSE-2023-37', dept: 'Computer System Engineering', sup: 'dr.rabia@university.edu' },
  ];

  const studentsMap = {};
  for (const stu of studentDefs) {
    const supId = supervisorsMap[stu.sup] || null;
    let user = await User.findOne({ email: stu.email });
    if (!user) {
      user = await User.create({
        name: stu.name,
        email: stu.email,
        password: hashedPassword,
        role: 'student',
        department: stu.dept,
        studentId: stu.id,
        batch: '2023-2027',
        phone: '+92-321-555' + stu.id.slice(-4),
        assignedSupervisor: supId,
        isActive: true,
      });
    } else {
      await User.updateOne(
        { email: stu.email },
        {
          $set: {
            name: stu.name,
            department: stu.dept,
            studentId: stu.id,
            assignedSupervisor: supId,
            password: hashedPassword,
            isActive: true,
          },
        }
      );
    }
    studentsMap[stu.email] = user._id;
  }

  // 4. SEED COMPREHENSIVE PAST FYPS (38 HISTORICAL RECORDS)
  console.log('[Corpus Seed] Updating PreviousFYP collection (38 records)...');
  await PreviousFYP.deleteMany({});
  await PreviousFYP.insertMany(comprehensivePastFyps);
  console.log(`[Corpus Seed] Inserted ${comprehensivePastFyps.length} historical FYP records into corpus.`);

  // 5. CLEAR OLD PROPOSALS, PROJECTS, MARKS, PROGRESS
  console.log('[Corpus Seed] Resetting proposals, projects, marks, and progress for fresh seed...');
  await Proposal.deleteMany({});
  await Project.deleteMany({});
  await Marks.deleteMany({});
  await ProgressUpdate.deleteMany({});
  await Feedback.deleteMany({});

  // 6. PROPOSALS & PROJECTS SETUP (18 REALISTIC CASES SPANNING ALL DEPARTMENTS & FACULTY)
  const projectScenarios = [
    // Case 1: Pending proposal for Dr. Khursheed (Demo testing similarity: ~86%)
    {
      title: 'Real-Time Multi-Camera Surveillance and Face Recognition Security Suite',
      abstract: 'An automated campus security and attendance verification system utilizing YOLOv8 and DeepFace models deployed on edge servers to detect unauthorized personnel and mark real-time attendance.',
      domain: 'Computer System Engineering',
      tech: ['PyTorch', 'OpenCV', 'React', 'FastAPI', 'Docker'],
      studentEmail: 'student@university.edu',
      groupMembers: [{ name: 'Ali Ahmed', studentId: 'CSE-2023-01' }, { name: 'Teesha Kumari', studentId: 'CS-2023-13' }],
      supEmail: 'dr.khursheed@university.edu',
      propStatus: 'pending',
      similarity: 86.63,
      hasWarning: true,
      createProject: false,
    },
    // Case 2: In-Progress project under Dr. Khursheed (IoT Motor Maintenance)
    {
      title: 'IoT-Based Industrial Predictive Motor Maintenance and Vibration Analysis',
      abstract: 'An end-to-end industrial IoT solution integrating 3-axis vibration and thermal sensors on three-phase induction motors with TinyML anomaly detection on edge microcontrollers.',
      domain: 'Computer System Engineering',
      tech: ['ESP32', 'C++', 'Python', 'MQTT', 'InfluxDB', 'React'],
      studentEmail: 'student1@university.edu',
      groupMembers: [{ name: 'Bilal Khan', studentId: 'CSE-2023-02' }, { name: 'Ahmed Raza', studentId: 'CSE-2023-14' }],
      supEmail: 'dr.khursheed@university.edu',
      propStatus: 'approved',
      similarity: 24.5,
      hasWarning: false,
      createProject: true,
      projStatus: 'in-progress',
      milestone: 'srs',
      marks: [{ key: 'proposal_defense', score: 88, max: 100, remarks: 'Excellent industrial scope and sensor integration design.' }],
      progress: [
        { week: 3, title: 'Hardware sensor calibration', desc: 'Calibrated ADXL345 accelerometer with ESP32 via SPI bus.', completed: ['SPI bus configuration', 'ADC reading normalization'], next: ['MQTT telemetry publisher setup'], blockers: '' },
        { week: 4, title: 'MQTT Broker Integration', desc: 'Connected ESP32 to local Mosquitto MQTT broker over TLS.', completed: ['TLS certificate installation', 'Packet loss benchmark'], next: ['InfluxDB time-series ingestion'], blockers: '' },
      ],
    },
    // Case 3: Mid-Evaluation project under Dr. Tariq (Blockchain Energy Trading)
    {
      title: 'Decentralized Peer-to-Peer Renewable Energy Trading Platform on Ethereum',
      abstract: 'A distributed solar energy accounting ledger utilizing Solidity smart contracts and automated smart meters to enable prosumers to trade surplus kilowatt-hours with neighbors.',
      domain: 'Computer Science',
      tech: ['Solidity', 'Ethereum', 'Web3.js', 'React', 'Node.js', 'Hardhat'],
      studentEmail: 'student2@university.edu',
      groupMembers: [{ name: 'Sara Noor', studentId: 'CS-2023-03' }],
      supEmail: 'dr.tariq@university.edu',
      propStatus: 'approved',
      similarity: 18.2,
      hasWarning: false,
      createProject: true,
      projStatus: 'mid_evaluation',
      milestone: 'mid_evaluation',
      marks: [
        { key: 'proposal_defense', score: 92, max: 100, remarks: 'Strong mathematical modeling of auction mechanism.' },
        { key: 'srs', score: 89, max: 100, remarks: 'Complete software requirements specification provided.' },
      ],
      progress: [
        { week: 6, title: 'Smart contract test suite', desc: 'Wrote 35 unit tests for energy auction matching contract.', completed: ['Orderbook escrow logic', 'Gas optimization tests'], next: ['React web3 wallet connection'], blockers: '' },
        { week: 8, title: 'Sepolia Testnet Deployment', desc: 'Deployed auction contracts on Sepolia testnet and verified on Etherscan.', completed: ['Contract deployment', 'Event indexing via The Graph'], next: ['Prepare mid-defense presentation'], blockers: '' },
      ],
    },
    // Case 4: In-Progress project under Dr. Amna (Microservices Canary)
    {
      title: 'Zero-Downtime Microservices Orchestration with Automated Canary Rollouts',
      abstract: 'A cloud-native DevOps platform integrating Prometheus real-time latency telemetry with custom Kubernetes controllers to trigger progressive automated canary deployments.',
      domain: 'Software Engineering',
      tech: ['Kubernetes', 'Go', 'Docker', 'Prometheus', 'Helm', 'React'],
      studentEmail: 'student3@university.edu',
      groupMembers: [{ name: 'Hamza Malik', studentId: 'SE-2023-04' }],
      supEmail: 'dr.amna@university.edu',
      propStatus: 'approved',
      similarity: 15.0,
      hasWarning: false,
      createProject: true,
      projStatus: 'in-progress',
      milestone: 'srs',
      marks: [{ key: 'proposal_defense', score: 85, max: 100, remarks: 'Well-structured DevOps architectural blueprint.' }],
      progress: [
        { week: 4, title: 'Custom Kubernetes Controller Scaffold', desc: 'Developed controller scaffolding using Kubebuilder and Go client-go SDK.', completed: ['CRD definition', 'Reconciliation loop logic'], next: ['Prometheus query client implementation'], blockers: '' },
      ],
    },
    // Case 5: Pending proposal for Dr. Fahad (Urdu OCR & NLP)
    {
      title: 'Automated Urdu Document Optical Character Recognition and NLP Translation',
      abstract: 'A deep learning OCR pipeline using CRNN and CTC loss for recognizing Nastaliq-script handwritten Urdu documents, coupled with an mBART model for syntactic translation into English.',
      domain: 'Computer System Engineering',
      tech: ['PyTorch', 'FastAPI', 'HuggingFace', 'Python', 'React'],
      studentEmail: 'student4@university.edu',
      groupMembers: [{ name: 'Zainab Fatima', studentId: 'CSE-2023-05' }, { name: 'Mustafa Kamal', studentId: 'CSE-2023-20' }],
      supEmail: 'dr.fahad@university.edu',
      propStatus: 'pending',
      similarity: 32.1,
      hasWarning: false,
      createProject: false,
    },
    // Case 6: Mid-Evaluation project under Dr. Khursheed (Federated Healthcare AI)
    {
      title: 'Federated Learning Framework for Multi-Hospital Privacy-Preserving Cancer Diagnosis',
      abstract: 'A decentralized federated machine learning network allowing multiple medical centers to collaboratively train a DenseNet-121 classifier for histopathology images without sharing patient records.',
      domain: 'Computer System Engineering',
      tech: ['PyTorch', 'PySyft', 'OpenCV', 'React', 'FastAPI'],
      studentEmail: 'student6@university.edu',
      groupMembers: [{ name: 'Ayesha Malik', studentId: 'CSE-2023-07' }],
      supEmail: 'dr.khursheed@university.edu',
      propStatus: 'approved',
      similarity: 28.4,
      hasWarning: false,
      createProject: true,
      projStatus: 'mid_evaluation',
      milestone: 'mid_evaluation',
      marks: [
        { key: 'proposal_defense', score: 95, max: 100, remarks: 'Exceptional proposal on privacy-preserving healthcare AI.' },
        { key: 'srs', score: 92, max: 100, remarks: 'Thorough compliance with HIPAA and data protection standards.' },
        { key: 'mid_evaluation', score: 90, max: 100, remarks: 'Federated aggregation model working seamlessly on simulated nodes.' },
      ],
      progress: [
        { week: 7, title: 'Differential privacy noise injection', desc: 'Added Laplace differential privacy noise to local gradient updates.', completed: ['Gradient clipping', 'Epsilon budget tracker'], next: ['Benchmark model convergence speed'], blockers: '' },
        { week: 10, title: 'Multi-node federation test', desc: 'Simulated 5 hospital nodes in Docker containers and evaluated global accuracy.', completed: ['Federated averaging algorithm', 'Confusion matrix generation'], next: ['Mid-evaluation demo slides'], blockers: '' },
      ],
    },
    // Case 7: In-Progress project under Dr. Amna (Traffic Congestion GNN)
    {
      title: 'Real-Time Traffic Congestion Optimization using Graph Neural Networks',
      abstract: 'An adaptive urban traffic management platform that models city road networks as spatial-temporal graphs and predicts queue lengths using GNNs to optimize traffic signal timings in real-time.',
      domain: 'Software Engineering',
      tech: ['Python', 'PyTorch Geometric', 'SUMO Simulator', 'React', 'Node.js'],
      studentEmail: 'student7@university.edu',
      groupMembers: [{ name: 'Omer Farooq', studentId: 'SE-2023-08' }, { name: 'Farhan Siddiqui', studentId: 'SE-2023-12' }],
      supEmail: 'dr.amna@university.edu',
      propStatus: 'approved',
      similarity: 33.2,
      hasWarning: false,
      createProject: true,
      projStatus: 'in-progress',
      milestone: 'srs',
      marks: [{ key: 'proposal_defense', score: 86, max: 100, remarks: 'Very relevant topic for municipal smart city infrastructure.' }],
      progress: [
        { week: 4, title: 'SUMO traffic simulation dataset', desc: 'Generated synthetic traffic network model using SUMO OpenStreetMap export.', completed: ['Graph edge weight assignment', 'Vehicle speed flow logs'], next: ['ST-GCN model implementation'], blockers: '' },
      ],
    },
    // Case 8: In-Progress project under Dr. Sana Mir (Smart Wheelchair)
    {
      title: 'Assistive Smart Wheelchair with Eye-Gaze Tracking and Obstacle Avoidance',
      abstract: 'A hands-free motorized mobility solution integrating an eye-tracking infrared camera with an ultrasonic sensor grid and Raspberry Pi 5 to guide quadriplegic patients safely.',
      domain: 'Computer System Engineering',
      tech: ['Raspberry Pi', 'Python', 'OpenCV', 'TensorFlow Lite', 'Arduino'],
      studentEmail: 'student8@university.edu',
      groupMembers: [{ name: 'Hina Riaz', studentId: 'CSE-2023-09' }],
      supEmail: 'dr.sanamir@university.edu',
      propStatus: 'approved',
      similarity: 22.0,
      hasWarning: false,
      createProject: true,
      projStatus: 'in-progress',
      milestone: 'srs',
      marks: [{ key: 'proposal_defense', score: 90, max: 100, remarks: 'High social impact project with solid sensor hardware foundation.' }],
      progress: [
        { week: 5, title: 'Pupil center estimation pipeline', desc: 'Trained a light neural gaze estimator running at 30 FPS on Raspberry Pi.', completed: ['Infrared LED illumination ring', 'Calibration matrix'], next: ['Motor driver PWM interface'], blockers: '' },
      ],
    },
    // Case 9: Changes Requested under Dr. Tariq (Pharma Supply Chain)
    {
      title: 'Decentralized Pharmaceutical Supply Chain Provenance Tracker',
      abstract: 'An anti-counterfeit drug provenance tracker storing serialization data on Polygon blockchain with dynamic QR code verification for pharmacies and consumer verification.',
      domain: 'Computer Science',
      tech: ['Polygon', 'Solidity', 'Node.js', 'React Native', 'MongoDB'],
      studentEmail: 'student9@university.edu',
      groupMembers: [{ name: 'Daniyal Qureshi', studentId: 'CS-2023-10' }],
      supEmail: 'dr.tariq@university.edu',
      propStatus: 'changes_requested',
      similarity: 41.5,
      hasWarning: false,
      createProject: false,
      feedback: 'Please refine the gas optimization strategy and explain how offline pharmacies handle verification.',
    },
    // Case 10: Completed project under Dr. Fahad (Microservices Observability - Final Grade A+)
    {
      title: 'High-Throughput Distributed Microservices Observability and Auto-Recovery',
      abstract: 'An enterprise cloud resilience engine monitoring gRPC and HTTP microservice dependencies with Jaeger tracing and OpenTelemetry, executing automated pod evictions on memory leaks.',
      domain: 'Computer System Engineering',
      tech: ['Go', 'Docker', 'Kubernetes', 'Jaeger', 'Prometheus', 'React'],
      studentEmail: 'student15@university.edu',
      groupMembers: [{ name: 'Kashif Ali', studentId: 'CSE-2023-16' }],
      supEmail: 'dr.fahad@university.edu',
      propStatus: 'approved',
      similarity: 12.0,
      hasWarning: false,
      createProject: true,
      projStatus: 'completed',
      milestone: 'completed',
      finalMarks: 94,
      finalGrade: 'A+',
      marks: [
        { key: 'proposal_defense', score: 90, max: 100, remarks: 'Solid architectural proposal.' },
        { key: 'srs', score: 92, max: 100, remarks: 'Detailed sequence diagrams and SLA criteria.' },
        { key: 'mid_evaluation', score: 94, max: 100, remarks: 'Live cluster chaos monkey test executed flawlessly.' },
        { key: 'final_defense', score: 96, max: 100, remarks: 'Exceptional final thesis and production-grade demonstration.' },
      ],
      progress: [
        { week: 14, title: 'Final Thesis & Benchmarking', desc: 'Completed load testing with k6 simulating 50,000 requests/sec with auto-recovery.', completed: ['Final thesis manuscript', 'GitHub release v1.0.0'], next: ['Final defense presentation'], blockers: '' },
      ],
    },
    // Case 11: Pending proposal for Dr. Asif Nawaz (Autonomous Indoor Drone)
    {
      title: 'Autonomous Indoor Drone Navigation using 3D LiDAR SLAM and PX4 Autopilot',
      abstract: 'A quadcopter platform capable of GPS-denied indoor localization, real-time 3D voxel mapping, and dynamic obstacle avoidance for structural inspection of industrial warehouses.',
      domain: 'Computer System Engineering',
      tech: ['PX4', 'ROS2', 'Python', 'C++', '3D LiDAR', 'Jetson Orin'],
      studentEmail: 'student20@university.edu',
      groupMembers: [{ name: 'Mahnoor Shah', studentId: 'CSE-2023-21' }, { name: 'Waleed Khan', studentId: 'CSE-2023-18' }],
      supEmail: 'dr.asif@university.edu',
      propStatus: 'pending',
      similarity: 48.7,
      hasWarning: false,
      createProject: false,
    },
    // Case 12: In-Progress project under Dr. Asif Nawaz (Solar Microgrid)
    {
      title: 'Smart Solar Microgrid Peak Shaving and Battery Energy Management System',
      abstract: 'A hardware-in-the-loop energy controller predicting hourly campus solar generation using temporal convolutional networks to schedule battery storage discharge during peak tariff hours.',
      domain: 'Computer System Engineering',
      tech: ['Python', 'TensorFlow', 'Modbus', 'Raspberry Pi', 'React'],
      studentEmail: 'student22@university.edu',
      groupMembers: [{ name: 'Fatima Jamil', studentId: 'CSE-2023-23' }, { name: 'Maryam Nawaz', studentId: 'CSE-2023-11' }],
      supEmail: 'dr.asif@university.edu',
      propStatus: 'approved',
      similarity: 26.3,
      hasWarning: false,
      createProject: true,
      projStatus: 'in-progress',
      milestone: 'srs',
      marks: [{ key: 'proposal_defense', score: 91, max: 100, remarks: 'Outstanding energy optimization model and campus testbed setup.' }],
      progress: [
        { week: 4, title: 'Inverter Modbus Telemetry', desc: 'Configured RS485 to USB converter to read real-time kW and battery state-of-charge.', completed: ['Modbus register map', 'InfluxDB logger'], next: ['TCN forecasting pipeline'], blockers: '' },
      ],
    },
    // Case 13: Pending proposal for Dr. Zafar Iqbal (EEG BCI Wheelchair)
    {
      title: 'Non-Invasive BCI Wheelchair Controller using Motor Imagery EEG Signals',
      abstract: 'A brain-computer interface capturing 8-channel EEG motor imagery signals to steer an electric motorized wheelchair with real-time signal artifact filtering and classification.',
      domain: 'Computer System Engineering',
      tech: ['OpenBCI', 'Python', 'MNE', 'PyTorch', 'Arduino', 'Bluetooth'],
      studentEmail: 'student21@university.edu',
      groupMembers: [{ name: 'Babar Azam', studentId: 'CSE-2023-22' }, { name: 'Rizwan Qasim', studentId: 'CSE-2023-26' }],
      supEmail: 'dr.zafar@university.edu',
      propStatus: 'pending',
      similarity: 54.2,
      hasWarning: false,
      createProject: false,
    },
    // Case 14: Completed project under Dr. Asif Nawaz (Warehouse AGV - Final Grade A)
    {
      title: 'Autonomous Mobile Warehouse Robot Navigation using ROS2 and 2D LiDAR SLAM',
      abstract: 'A differential drive industrial AGV utilizing Nav2, Cartographer SLAM, and magnetic floor sensor docking to automate material transport in manufacturing plants.',
      domain: 'Computer System Engineering',
      tech: ['ROS2', 'Nav2', 'Python', 'C++', 'LiDAR', 'STM32'],
      studentEmail: 'student17@university.edu',
      groupMembers: [{ name: 'Waleed Khan', studentId: 'CSE-2023-18' }],
      supEmail: 'dr.asif@university.edu',
      propStatus: 'approved',
      similarity: 38.5,
      hasWarning: false,
      createProject: true,
      projStatus: 'completed',
      milestone: 'completed',
      finalMarks: 91,
      finalGrade: 'A',
      marks: [
        { key: 'proposal_defense', score: 88, max: 100, remarks: 'Clear ROS2 simulation and hardware selection.' },
        { key: 'srs', score: 90, max: 100, remarks: 'Well-specified navigation accuracy requirements.' },
        { key: 'mid_evaluation', score: 92, max: 100, remarks: 'Robot localization achieved sub-5cm precision.' },
        { key: 'final_defense', score: 94, max: 100, remarks: 'Impressive live navigation demonstration in hallway.' },
      ],
      progress: [
        { week: 13, title: 'Final navigation benchmark', desc: 'Tested 50 autonomous docking runs with zero collisions.', completed: ['Docking precision report', 'Thesis chapter 5'], next: ['Defense rehearsal'], blockers: '' },
      ],
    },
    // Case 15: Pending proposal for Dr. Kashif Mehmood (Zero-Trust Security)
    {
      title: 'Zero-Trust Cloud-Native Security Fabric for Microservices Architecture',
      abstract: 'A continuous authentication and authorization proxy for Kubernetes deploying dynamic SPIFFE/SPIRE cryptographically verified identity tokens across gRPC communications.',
      domain: 'Computer Science',
      tech: ['Go', 'Kubernetes', 'SPIFFE', 'Envoy', 'React'],
      studentEmail: 'student26@university.edu',
      groupMembers: [{ name: 'Saba Karim', studentId: 'CS-2023-27' }, { name: 'Mehwish Hayat', studentId: 'CS-2023-29' }],
      supEmail: 'dr.kashif@university.edu',
      propStatus: 'pending',
      similarity: 21.4,
      hasWarning: false,
      createProject: false,
    },
    // Case 16: Changes Requested under Dr. Nadia Rehman (Post-Quantum Cryptography)
    {
      title: 'Quantum-Resistant Post-Quantum Cryptography for IoT Smart Meters',
      abstract: 'Implementation and energy benchmarking of NIST-standardized Kyber lattice-based key encapsulation mechanism on ARM Cortex-M4 microcontrollers for smart grid telemetry.',
      domain: 'Software Engineering',
      tech: ['C', 'ARM Cortex-M4', 'Python', 'FastAPI', 'React'],
      studentEmail: 'student31@university.edu',
      groupMembers: [{ name: 'Fahad Mustafa', studentId: 'SE-2023-32' }],
      supEmail: 'dr.nadia@university.edu',
      propStatus: 'changes_requested',
      similarity: 19.8,
      hasWarning: false,
      createProject: false,
      feedback: 'Please provide benchmark metrics on RAM footprint constraints on low-end microcontrollers.',
    },
    // Case 17: Mid-Evaluation project under Dr. Nadia Rehman (Telemedicine Suite)
    {
      title: 'Cross-Platform WebRTC Telemedicine Platform with End-to-End Encryption',
      abstract: 'A HIPAA-compliant clinical consultation web and mobile application utilizing WebRTC mesh topologies, double ratcheted E2EE messaging, and automated vital sign charting.',
      domain: 'Software Engineering',
      tech: ['WebRTC', 'React', 'Node.js', 'Socket.io', 'MongoDB'],
      studentEmail: 'student32@university.edu',
      groupMembers: [{ name: 'Iqra Aziz', studentId: 'SE-2023-33' }, { name: 'Alizeh Shah', studentId: 'SE-2023-35' }],
      supEmail: 'dr.nadia@university.edu',
      propStatus: 'approved',
      similarity: 29.1,
      hasWarning: false,
      createProject: true,
      projStatus: 'mid_evaluation',
      milestone: 'mid_evaluation',
      marks: [
        { key: 'proposal_defense', score: 89, max: 100, remarks: 'Strong privacy architecture and usability.' },
        { key: 'srs', score: 91, max: 100, remarks: 'Comprehensive compliance and user journey maps.' },
      ],
      progress: [
        { week: 8, title: 'WebRTC Signaling & Media Relay', desc: 'Configured Coturn TURN server and verified low-latency 1080p video calls.', completed: ['TURN server setup', 'E2EE signaling channel'], next: ['Doctor prescription generator'], blockers: '' },
      ],
    },
    // Case 18: In-Progress project under Dr. Rabia Basri (Edge Plant Pathology)
    {
      title: 'Edge-AI Powered Tomato Foliar Disease Classification and Yield Estimation',
      abstract: 'A solar-powered IoT camera pole executing quantized MobileNetV3 models to detect early-stage bacterial spot and early blight on tomato crops with automated SMS alerts.',
      domain: 'Computer System Engineering',
      tech: ['Raspberry Pi', 'TensorFlow Lite', 'Python', 'MQTT', 'React'],
      studentEmail: 'student35@university.edu',
      groupMembers: [{ name: 'Shahzad Noor', studentId: 'CSE-2023-36' }, { name: 'Nimra Khan', studentId: 'CSE-2023-37' }],
      supEmail: 'dr.rabia@university.edu',
      propStatus: 'approved',
      similarity: 27.5,
      hasWarning: false,
      createProject: true,
      projStatus: 'in-progress',
      milestone: 'srs',
      marks: [{ key: 'proposal_defense', score: 87, max: 100, remarks: 'High practical utility for provincial agriculture.' }],
      progress: [
        { week: 4, title: 'Dataset curation and transfer learning', desc: 'Fine-tuned MobileNetV3 on 8,000 field images achieving 94.2% test accuracy.', completed: ['Data augmentation', 'Quantization to INT8'], next: ['Deploy model on Raspberry Pi 4'], blockers: '' },
      ],
    },
  ];

  for (const sc of projectScenarios) {
    const studentId = studentsMap[sc.studentEmail];
    const supId = supervisorsMap[sc.supEmail];

    const proposal = await Proposal.create({
      title: sc.title,
      abstract: sc.abstract,
      domain: sc.domain,
      technologies: sc.tech,
      submittedBy: studentId,
      groupMembers: sc.groupMembers,
      supervisor: supId,
      status: sc.propStatus,
      similarityScore: sc.similarity,
      similarityWarning: sc.hasWarning,
      assignedSupervisor: supId,
    });

    if (sc.feedback) {
      await Feedback.create({
        proposal: proposal._id,
        author: supId,
        content: sc.feedback,
        feedbackType: 'proposal_feedback',
      });
    }

    if (sc.createProject) {
      const project = await Project.create({
        proposal: proposal._id,
        title: sc.title,
        abstract: sc.abstract,
        domain: sc.domain,
        technologies: sc.tech,
        students: [studentId],
        supervisor: supId,
        status: sc.projStatus,
        currentMilestone: sc.milestone,
        finalMarks: sc.finalMarks || null,
        finalGrade: sc.finalGrade || '',
      });

      // Seed Marks
      if (sc.marks && sc.marks.length > 0) {
        for (const m of sc.marks) {
          await Marks.create({
            project: project._id,
            student: studentId,
            milestoneKey: m.key,
            marksAwarded: m.score,
            maxMarks: m.max || 100,
            gradedBy: supId,
            remarks: m.remarks,
          });
        }
      }

      // Seed Progress Updates
      if (sc.progress && sc.progress.length > 0) {
        for (const p of sc.progress) {
          await ProgressUpdate.create({
            project: project._id,
            student: studentId,
            title: p.title,
            description: p.desc,
            weekNumber: p.week,
            tasksCompleted: p.completed,
            nextWeekPlan: p.next,
            blockers: p.blockers || '',
            status: 'reviewed',
          });
        }
      }
    }
  }

  // Print final summary stats
  const totalUsers = await User.countDocuments();
  const totalFaculty = await User.countDocuments({ role: 'supervisor' });
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalProps = await Proposal.countDocuments();
  const pendingProps = await Proposal.countDocuments({ status: 'pending' });
  const totalProjs = await Project.countDocuments();
  const totalMarks = await Marks.countDocuments();
  const totalProgress = await ProgressUpdate.countDocuments();
  const totalPastFyps = await PreviousFYP.countDocuments();

  console.log('\n======================================================');
  console.log('   UNIVERSITY FYP PORTAL: COMPREHENSIVE CORPUS SEEDED');
  console.log('======================================================');
  console.log(`- Total Users:                ${totalUsers} (1 Admin, ${totalFaculty} Faculty Supervisors, ${totalStudents} Students)`);
  console.log(`- Historical FYP Archive:     ${totalPastFyps} past FYP records for AI Similarity`);
  console.log(`- Proposals:                  ${totalProps} (${pendingProps} pending review)`);
  console.log(`- Active Projects:            ${totalProjs} (In-progress, Mid-eval, Completed)`);
  console.log(`- Marks Records:              ${totalMarks} evaluations`);
  console.log(`- Weekly Progress Records:    ${totalProgress} progress logs`);
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seedCompleteCorpus().catch((err) => {
  console.error('[Corpus Seed Error]:', err);
  process.exit(1);
});
