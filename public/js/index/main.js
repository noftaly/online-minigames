const socket = io();

socket.emit('hub:connected');

socket.on('chat:hub', (data) => {
  console.log('New message received :');
  console.log(data);
});

socket.on('hub:serverUpdate', (data) => {
  showServerList(data.servers);
});

function showServerList(servers) {
  let html = '';

  if (servers.length === 0) {
    html = '<p>There is not any servers online! You can create one if you want to play ;)</p>';
  } else {
    html += '<ul>';
    const stages = ['Waiting for players...', 'Playing'];
    const games = ['Tic Tac Toe', 'Connect 4']

    for (const server of servers) {
      html += `
        <li class="my-2">
          <a
            href="${server.link}"
            role="button"
            class="btn btn-primary ${server.connections === server.maxPlayers ? 'disabled' : ''} py-1 px-3 mr-2">
            Join ${games[server.game]}
          </a>
          Game <strong>${games[server.game]}</strong>
          (${server.connections}/${server.maxPlayers}) ${server.connections === server.maxPlayers ? '[full]' : ''}
          (server ${server.serverId})
          (stage: ${stages[server.stage]})
        </li>`;
    }
    html += '</ul>';
  }

  document.getElementById('server-list').innerHTML = html;
}
