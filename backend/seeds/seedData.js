require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Fee = require('../models/Fee');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Class.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Fee.deleteMany({});

    console.log('Cleared existing data');

    // Create Subjects
    const subjectsData = [
      { name: 'Mathematics' },
      { name: 'Science' },
      { name: 'Social Studies' },
      { name: 'English' },
      { name: 'Telugu' },
      { name: 'Hindi' },
      { name: 'Environmental Science (EVS)' },
    ];

    const subjects = await Subject.insertMany(subjectsData);
    console.log(`Created ${subjects.length} subjects`);

    // Create Super Admin
    const superAdmin = new User({
      userId: 'SUPERADMIN001',
      password: 'Admin@123',
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@school.com',
      phone: '9876543210',
    });
    await superAdmin.save();
    console.log('Created Super Admin');

    // Create Principal
    const principal = new User({
      userId: 'PRINCIPAL001',
      password: 'Principal@123',
      role: 'principal',
      firstName: 'Dr.',
      lastName: 'Kumar',
      email: 'principal@school.com',
      phone: '9876543211',
    });
    await principal.save();
    console.log('Created Principal');

    // Create Teachers
    const teacherData = [
      { firstName: 'Ramesh', lastName: 'Sharma', subject: subjects[0], subjectName: 'Mathematics' },
      { firstName: 'Priya', lastName: 'Patel', subject: subjects[1], subjectName: 'Science' },
      { firstName: 'Rajesh', lastName: 'Singh', subject: subjects[2], subjectName: 'Social Studies' },
      { firstName: 'Sneha', lastName: 'Gupta', subject: subjects[3], subjectName: 'English' },
      { firstName: 'Suresh', lastName: 'Rao', subject: subjects[4], subjectName: 'Telugu' },
      { firstName: 'Neha', lastName: 'Verma', subject: subjects[5], subjectName: 'Hindi' },
      { firstName: 'Vikram', lastName: 'Joshi', subject: subjects[6], subjectName: 'EVS' },
    ];

    let teacherCount = 1;
    const teachers = [];

    for (const tData of teacherData) {
      const user = new User({
        userId: `TEACHER${String(teacherCount).padStart(3, '0')}`,
        password: 'Teacher@123',
        role: 'teacher',
        firstName: tData.firstName,
        lastName: tData.lastName,
        email: `${tData.firstName.toLowerCase()}@school.com`,
        phone: `987654321${teacherCount}`,
      });
      await user.save();

      const teacher = new Teacher({
        userId: user._id,
        subject: tData.subject._id,
        qualifications: 'B.Ed, M.A',
        experience: 5,
        joinDate: new Date('2019-01-01'),
        salary: 50000,
      });
      await teacher.save();
      teachers.push(teacher);
      teacherCount++;
    }

    console.log(`Created ${teachers.length} teachers`);

    // Create Classes (Grade 1-10, Sections A, B, C)
    const classes = [];
    for (let grade = 1; grade <= 10; grade++) {
      for (const section of ['A', 'B', 'C']) {
        const classData = new Class({
          grade,
          section,
          classTeacher: teachers[Math.floor(Math.random() * teachers.length)]._id,
        });
        await classData.save();
        classes.push(classData);
      }
    }
    console.log(`Created ${classes.length} classes`);

    // Create Parents
    const parentFirstNames = ['Rajesh', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Neha', 'Suresh', 'Pooja', 'Anil', 'Kavya'];
    const parentLastNames = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Verma', 'Joshi', 'Rao', 'Kumar', 'Reddy', 'Nair'];
    const parents = [];

    for (let i = 0; i < 10; i++) {
      const parent = new User({
        userId: `PARENT${String(i + 1).padStart(3, '0')}`,
        password: 'Parent@123',
        role: 'parent',
        firstName: parentFirstNames[i],
        lastName: parentLastNames[i],
        email: `${parentFirstNames[i].toLowerCase()}@email.com`,
        phone: `8765432${String(i).padStart(3, '0')}`,
      });
      await parent.save();
      parents.push(parent);
    }
    console.log(`Created ${parents.length} parents`);

    // Create Students
    const studentFirstNames = ['Aarav', 'Anaya', 'Arjun', 'Aditi', 'Aditya', 'Aisha', 'Ajay', 'Amrita', 'Akshay', 'Alisha'];
    const studentLastNames = ['Singh', 'Sharma', 'Patel', 'Gupta', 'Kumar', 'Verma', 'Joshi', 'Rao', 'Reddy', 'Nair'];

    const students = [];
    for (let i = 0; i < 10; i++) {
      const user = new User({
        userId: `STUDENT${String(i + 1).padStart(3, '0')}`,
        password: 'Student@123',
        role: 'student',
        firstName: studentFirstNames[i],
        lastName: studentLastNames[i],
        email: `${studentFirstNames[i].toLowerCase()}@school.com`,
        phone: `9876543${String(i).padStart(3, '0')}`,
      });
      await user.save();

      const assignedClass = classes[Math.floor(Math.random() * classes.length)];
      const student = new Student({
        userId: user._id,
        rollNumber: `ROLL${String(i + 1).padStart(3, '0')}`,
        class: assignedClass._id,
        parentId: parents[i]._id,
        admissionDate: new Date('2024-06-01'),
        bloodGroup: 'O+',
        totalFees: 50000,
      });
      await student.save();
      students.push(student);

      // Add student to class
      await Class.findByIdAndUpdate(assignedClass._id, {
        $push: { students: user._id },
      });
    }
    console.log(`Created ${students.length} students`);

    // Create Accountant & Admin
    const accountant = new User({
      userId: 'ACCOUNTANT001',
      password: 'Accountant@123',
      role: 'accountant_admin',
      firstName: 'Ravi',
      lastName: 'Verma',
      email: 'accountant@school.com',
      phone: '9876543299',
    });
    await accountant.save();
    console.log('Created Accountant & Admin');

    // Create Fees for Students
    for (const student of students) {
      const fee = new Fee({
        student: student.userId,
        amount: 50000,
        description: 'Annual Tuition Fees',
        dueDate: new Date('2024-12-31'),
        isPaid: Math.random() > 0.5,
        paymentMethod: ['PhonePe', 'Credit Card', 'Debit Card', 'Cash', 'Cheque'][Math.floor(Math.random() * 5)],
      });
      await fee.save();
    }
    console.log('Created fees for students');

    console.log('✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
