import pool from "../config/db.js";

export const uploadAdvocate = async (req, res) => {
 const {
    case_no,
    court_hall_no,
    petitioner_name,
    counsel_name_through_vc,
    technical_person,
    uploaded_file,
    remarks,
  } = req.body;

  if (
    !case_no ||
    !court_hall_no ||
    !petitioner_name ||
    !counsel_name_through_vc ||
    !technical_person ||
    !uploaded_file
  ) {
    return res.status(400).json({
      success: false,
      error: "Missing required advocate fields",
    });
  }

  try {
    // Get max serial_no
    const maxResult = await pool.query("SELECT MAX(serial_no) as max_serial FROM advocates");
    const serial_no = (maxResult.rows[0].max_serial || 0) + 1;

    // Current date
    const hearing_date = new Date().toISOString().slice(0, 10);

    const query = `
      INSERT INTO advocates (
        serial_no,
        hearing_date,
        case_no,
        court_hall_no,
        petitioner_name,
        counsel_name_through_vc,
        technical_person,
        uploaded_file,
        remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      serial_no,
      hearing_date,
      case_no,
      court_hall_no,
      petitioner_name,
      counsel_name_through_vc,
      technical_person,
      uploaded_file,
      remarks || null,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Advocate record created successfully",
      advocate: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
export const getAdvocates = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM advocates ORDER BY serial_no DESC");
    res.json({
      success: true,
      advocates: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};  
