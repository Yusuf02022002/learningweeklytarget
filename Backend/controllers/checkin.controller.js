import { supabase } from "../config/supabase.js";

export const getAllCheckin = async (req, res) => {
  const userId = Number(req.query.userId);

  if (!userId) return res.status(400).json({ error: "userId is required" });

  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) return res.status(400).json({ error });

  res.json(data);
};

export const addCheckin = async (req, res) => {
  const { userId, date, mood, text } = req.body;

  if (!userId || !date || !mood)
    return res.status(400).json({ error: "Payload tidak lengkap" });

  const { data, error } = await supabase
    .from("checkins")
    .insert({
      user_id: userId,
      date,
      mood,
      text,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error });

  res.json(data);
};
