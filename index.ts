import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
import dotenv from 'dotenv';
dotenv.config();

// Role to track in status
const STATUS_ROLE = process.env.STATUS_ROLE || '';

// Starting event
client.on('ready', () => {
  console.log(`${client.user?.tag} is alive!`);
  client.guilds.cache.forEach(guild => {
    updateMemberCount(guild);
    updateStatus(guild); 
  });
});

// Update member count when a member joins
client.on('guildMemberAdd', member => {
  updateMemberCount(member.guild);
  updateStatus(member.guild);
});

// ... and when a member leaves
client.on('guildMemberRemove', member => {
  updateMemberCount(member.guild);
  updateStatus(member.guild);
});

// Update nickname function
async function updateMemberCount(guild: any) {
  const botMember = guild.members.me; 
  const newMemberCount = guild.memberCount;
  const currentMemberCount = botMember.displayName; 
  if (newMemberCount === currentMemberCount) return
  await botMember.setNickname(`Guerreros: ${newMemberCount}`).catch((error: Error) =>
    console.error(`Error al cambiar apodo: ${error}`));
}

// Update status function
function updateStatus(guild: any) {
  const role = guild.roles.cache.find((r: { name: string; id: string; }) => r.name === STATUS_ROLE || r.id === STATUS_ROLE);
  if (!role) {
    console.error(`Role ${STATUS_ROLE} not found in server ${guild.name}`);
    client.user?.setActivity(`Rol no encontrado`);
    return;
  }

  const roleCount = role.members.size; 
  client.user!.setPresence({
    activities: [
      {
        type: ActivityType.Custom,
        name: 'custom',
        state: `${STATUS_ROLE}s: ${roleCount}`,
      },
    ],
    status: 'online',
  })
}

// Discord bot token authentication
client.login(process.env.DISCORD_TOKEN);