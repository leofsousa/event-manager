import { createClient } from "@supabase/supabase-js";

const supabaseurl = "https://nzlmnwxwpcfursfhuejl.supabase.co";
const supabasekey = "sb_publishable__lzBNmiInHtH-qDK5Ad1IA_PsrTqSRR"; 

export const supabase = createClient(supabaseurl, supabasekey)