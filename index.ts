import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
import { config } from 'dotenv';
config();

const STATUS_ROLE = process.env.STATUS_ROLE;
const SERVER_ID: any = process.env.SERVER_ID;

client.on('ready', () => {
  console.log(`${client.user?.tag} is alive!`);
  const guild = client.guilds.cache.get(SERVER_ID);
  if (guild) {
    updateMemberCount(guild);
    updateStatus(guild);
  } else {
    console.error(`Guild with ID ${SERVER_ID} not found`);
  }
});

client.on('guildMemberAdd', member => {
  updateMemberCount(member.guild);
  updateStatus(member.guild);
});

client.on('guildMemberRemove', member => {
  updateMemberCount(member.guild);
  updateStatus(member.guild);
});

async function updateMemberCount(guild: any) {
  const botMember = guild.members.me;
  await guild.members.fetch().catch((error: Error) =>
    console.error(`Error fetching members: ${error}`)
  );
  const humanCount = guild.members.cache.filter((m: any) => !m.user.bot).size;
  const currentMemberCount = botMember.displayName;

  if (currentMemberCount === `Guerreros: ${humanCount}`) return;

  await botMember.setNickname(`Guerreros: ${humanCount}`).catch((error: Error) =>
    console.error(`Error trying to change nickname: ${error}`)
  );
}

async function updateStatus(guild: any) {
  await guild.members.fetch().catch((error: Error) =>
    console.error(`Error fetching members: ${error}`)
  );
  
  
  const role = guild.roles.cache.find((r: { name: string; id: string; }) => {
    if (STATUS_ROLE && STATUS_ROLE.includes('*')) {
      const regex = new RegExp(STATUS_ROLE.replace(/\*/g, '.*'), 'i');
      return regex.test(r.name) || r.id === STATUS_ROLE;
    }
    return r.name.toLowerCase().includes((STATUS_ROLE || '').toLowerCase()) || r.id === STATUS_ROLE;
  });

  const roleCount = role.members.size; 
  client.user!.setPresence({
    activities: [
      {
        type: ActivityType.Custom,
        name: 'custom',
        state: `${STATUS_ROLE}: ${roleCount}`,
      },
    ],
    status: 'online',
  })
}

client.login(process.env.DISCORD_TOKEN);