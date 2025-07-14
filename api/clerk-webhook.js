import { Webhook } from 'svix';
import { supabase } from '../src/lib/supabase';

export default async function handler(req, res) {
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return res.status(500).json({ error: 'Missing CLERK_WEBHOOK_SECRET environment variable' });
  }

  // Verify webhook signature
  const payload = req.body;
  const headers = req.headers;
  const wh = new Webhook(webhookSecret);
  
  let evt;
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const eventType = evt.type;
  const data = evt.data;

  // Handle user creation
  if (eventType === 'user.created') {
    try {
      const { id, email_addresses, first_name, last_name, public_metadata } = data;
      const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id);
      
      await supabase
        .from('users_pf')
        .insert({
          id: id,
          email: primaryEmail.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          role: public_metadata.role || 'client',
          status: 'active',
          created_at: new Date().toISOString(),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(first_name + ' ' + last_name)}&background=random`
        });
        
      return res.status(200).json({ message: 'User synchronized successfully' });
    } catch (error) {
      console.error('Error synchronizing user:', error);
      return res.status(500).json({ error: 'Failed to synchronize user' });
    }
  }

  // Handle user updates
  if (eventType === 'user.updated') {
    try {
      const { id, email_addresses, first_name, last_name, public_metadata } = data;
      const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id);
      
      await supabase
        .from('users_pf')
        .update({
          email: primaryEmail.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          role: public_metadata.role || 'client',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      return res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // Handle user deletion
  if (eventType === 'user.deleted') {
    try {
      await supabase
        .from('users_pf')
        .delete()
        .eq('id', data.id);
        
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  return res.status(200).json({ message: 'Webhook processed' });
}