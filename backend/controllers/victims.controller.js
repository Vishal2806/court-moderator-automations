import pool from "../config/db.js";

export const uploadVictim = async (req, res) => {
    try {

        const {
            case_no,
            court_hall_no,
            party_name,
            counsel_name_through_vc,
            technical_person,
            uploaded_file,
            remarks
        } = req.body;

        // Get max serial_no
        const maxResult = await pool.query("SELECT MAX(serial_no) as max_serial FROM victims");
        const serial_no = (maxResult.rows[0].max_serial || 0) + 1;

        // Current date
        const hearing_date = new Date().toISOString().slice(0, 10);

        const result = await pool.query(
            `
      INSERT INTO victims (
        serial_no,
        hearing_date,
        case_no,
        court_hall_no,
        party_name,
        counsel_name_through_vc,
        technical_person,
        uploaded_file,
        remarks
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
            [
                serial_no,
                hearing_date,
                case_no,
                court_hall_no,
                party_name,
                counsel_name_through_vc,
                technical_person,
                uploaded_file,
                remarks
            ]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }

};
export const getVictims = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM victims ORDER BY serial_no DESC");
    res.json({
      success: true,
      victims: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });     
    }    
    
};

