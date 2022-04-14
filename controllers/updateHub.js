import Server from '../models/server';
import { io } from '../server';


export default async function updateHub() {
  const servers = await Server.find();
  io.in('__hub__').emit('hub:serverUpdate', { servers });
}
