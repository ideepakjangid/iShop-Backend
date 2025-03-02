const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const UserModel = require("./models/user.model");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "naveengupta515499@gmail.com",
    pass: "zmnq lhty uskn ossp",
  },
});

// Function to send OTP via email
const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: "naveengupta515499@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending email: ", error);
    return { success: false, message: "Failed to send OTP" };
  }
};

const generateOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.send({
        flag: 0,
        message: "Email not exist",
      });
    }

    console.log("i am reached here");
    // Generate 4-digit OTP
    const otp = otpGenerator.generate(4, {
      digits: true,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });

    // Send OTP email
    const response = await sendOtpEmail(email, otp);

    if (response.success) {
      return res.status(200).json({flag:1, message: "OTP sent successfully", otp });
    } else {
      return res.status(500).json({flag:0, message: "Failed to send OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({flag:0, message: "Internal server error" });
  }
};

module.exports = generateOtp;
