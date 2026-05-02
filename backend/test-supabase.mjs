import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

(async () => {
  try {
    const sup = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const res = await sup.from('users').select('*').limit(1);
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  }
})();
