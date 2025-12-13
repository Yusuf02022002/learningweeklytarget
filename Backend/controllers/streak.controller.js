import { supabase } from "../config/supabase.js";

export const getTopStreaks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("streaks")
      .select(
        `
        *,
        user:users(id, name, avatar)
      `
      )
      .order("score", { ascending: false })
      .limit(5);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching top streaks:", err);
    res.status(400).json({ error: err.message });
  }
};

export const updateStreak = async (req, res) => {
  const { user_id, current_streak, best_streak, level, score, award } =
    req.body;

  try {
    const { data, error } = await supabase
      .from("streaks")
      .upsert({
        user_id,
        current_streak,
        best_streak,
        level,
        score,
        award,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error updating streak:", err);
    res.status(400).json({ error: err.message });
  }
};
