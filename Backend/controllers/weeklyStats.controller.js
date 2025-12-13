import { supabase } from "../config/supabase.js";

export const getWeeklyStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("weekly_stats")
      .select(
        `
        *,
        user:user_id (name, avatar)
      `
      )
      .order("best_streak", { ascending: false })
      .limit(5);

    if (error) throw error;

    const processedData = data.map((d) => ({
      id: d.id,
      user_id: d.user_id,
      user: d.user || { name: "Unknown", avatar: "default-avatar.png" },
      best_streak: d.best_streak || 0,
      total_minutes: (d.course_minutes || 0) + (d.assessment_minutes || 0),
      diff_minutes:
        (d.course_minutes || 0) +
        (d.assessment_minutes || 0) -
        (d.prev_week_minutes || 0),
      courses: d.courses || 0,
      assessments: d.assessments || 0,
      updated_at: d.updated_at,
    }));

    res.json(processedData);
  } catch (err) {
    console.error("Error fetching weekly stats:", err);
    res.status(400).json({ error: err.message });
  }
};

export const updateWeeklyStats = async (req, res) => {
  const {
    user_id,
    course_minutes,
    assessment_minutes,
    best_streak,
    courses,
    assessments,
    prev_week_minutes,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("weekly_stats")
      .upsert({
        user_id,
        course_minutes,
        assessment_minutes,
        best_streak,
        courses,
        assessments,
        prev_week_minutes,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error updating weekly stats:", err);
    res.status(400).json({ error: err.message });
  }
};
