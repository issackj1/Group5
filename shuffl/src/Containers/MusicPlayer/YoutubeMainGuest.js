import React, { Component } from 'react';
import '../../css/TempYouTube.css';
import YouTube from 'react-youtube';
import PlayerGuest from '../../Components/PlayerGuest';
import Chat from '../../Components/Chat';
import VideoList from '../MusicPlayer/video_list_guest';

class YouTubeMainGuest extends Component {
	constructor() {
		super();

		this.state = {
			queuebutton: false,
			chat: false,
			player: null,
			videoId: '',
			queueguest: [],
			messagesguest: [],
			videoTitle: ''
		};
	}

	componentDidMount() {
		this.props.socket.emit('reqqueue', this.props.RoomId, this.props.Username);

		this.props.socket.on(
			'receivemessage',
			function(msg) {
				this.setState({
					messagesguest: this.state.messagesguest.concat([ msg ])
				});
			}.bind(this)
		);

		this.props.socket.on(
			'receiveplay',
			function() {
				this.state.player.playVideo();
			}.bind(this)
		);

		this.props.socket.on(
			'receivepause',
			function() {
				this.state.player.pauseVideo();
			}.bind(this)
		);

		this.props.socket.on(
			'receivestop',
			function() {
				this.state.player.stopVideo();
			}.bind(this)
		);

		this.props.socket.on(
			'receiveskip',
			function() {
				this.state.player.loadVideoById(this.state.queueguest[0].id.videoId, 0, 'small');
				this.setState({ videoTitle: this.state.queueguest[0].snippet.title });
				this.setState({ queueguest: this.state.queueguest.slice(1) });
			}.bind(this)
		);

		this.props.socket.on(
			'receivetime',
			function(username, time, state, videoid, videotitle) {
				if (this.props.Username === username) {
					console.log(videoid);
					if (state === 1) {
						this.state.player.loadVideoById(videoid, time, 'small');
						this.setState({ videoTitle: videotitle });
					} else {
						this.state.player.cueVideoById(videoid, time, 'small');
					}
				}
			}.bind(this)
		);

		this.props.socket.on(
			'receivequeue',
			function(username, queue) {
				if (this.props.Username === username) {
					this.setState({ queueguest: queue });
				}
			}.bind(this)
		);

		this.props.socket.on(
			'updateQueue',
			function(queuelist) {
				this.setState({ queueguest: queuelist });
			}.bind(this)
		);

		this.props.socket.on(
			'updateVideo',
			function(videoid, videotitle) {
				this.state.player.loadVideoById(videoid, 0, 'small');
				this.setState({ videoTitle: videotitle });
				console.log("Video title: " + this.state.videoTitle)
			}.bind(this)
		);
	}

	nextVideo=()=>{
		if (this.state.queueguest.length > 0) {
			this.state.player.loadVideoById(this.state.queueguest[0].id.videoId, 0, 'small');
			this.setState({ videoTitle: this.state.queueguest[0].snippet.title });
			this.setState({ videoId: this.state.queueguest[0].id.videoId, queueguest: this.state.queueguest.slice(1) });
		}
	}
	componentDidUpdate(prevProps, prevState) {

		if (prevState.queueguest !== this.state.queueguest) {
			
		}

		if (prevState.player !== this.state.player) {
			this.state.player.setVolume(100);
			this.props.socket.emit('reqtime', this.props.RoomId, this.props.Username);
			this.props.socket.emit('reqqueue', this.props.RoomId, this.props.Username);
		}

		if (prevProps.RoomId !== this.props.RoomId) {
			this.setState({ queueguest: [], messagesguest: [], videoId: '' });
			if (this.state.player) {
				this.state.player.stopVideo();
			}
		}
	}

	queue = () => {
		this.setState({ queuebutton: !this.state.queuebutton });
	};

	chat = () => {
		this.setState({ chat: !this.state.chat });
	};

	handleReady = (e) => {
		this.setState({ player: e.target });
	};

	render() {
		const opts = {
			height: '0',
			width: '0',
			playerVars: {
				autoplay: 1
			}
		};

		return (
			<div className="parentYT">
				<div className="youtubeIframe">
					<YouTube videoId={this.state.videoId} opts={opts} onReady={this.handleReady} onEnd={this.nextVideo}/>
				</div>
				<PlayerGuest queue={this.queue} chat={this.chat} Roomname={this.props.Roomname} video={this.state.videoTitle}/>
				{this.state.queuebutton ? (
					<div className="footerGrey">
						<div className="videoListContainer">
							<VideoList videos={this.state.queueguest} />
						</div>
					</div>
				) : null}
				{this.state.chat ? (
					<Chat
						socket={this.props.socket}
						sendMessage={this.sendMessage}
						messages={this.state.messagesguest}
						users={this.state.users}
						Username={this.props.Username}
						RoomId={this.props.RoomId}
					/>
				) : null}
			</div>
		);
	}
}

export default YouTubeMainGuest;
