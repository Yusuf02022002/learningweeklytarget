import { supabase } from "../config/supabase.js";

export const getSchedules = async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("user_id", userId)
    .order("day");

  if (error) return res.status(400).json({ error });

  res.json(data);
};

export const updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { time, enabled } = req.body;

  const { data, error } = await supabase
    .from("schedules")
    .update({
      time,
      enabled,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error });

  res.json(data);
};

export const createSchedule = async (req, res) => {
  const { user_id, day, time, enabled } = req.body;

  const { data, error } = await supabase
    .from("schedules")
    .insert({
      user_id,
      day,
      time,
      enabled,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error });

  res.json(data);
};
