const {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  createContext
} = React;

// --- MOCK DATA ---
const MOCK_GENRES = [{
  id: 1,
  name: 'Synthwave',
  bg: 'linear-gradient(135deg, #00ffff, #0077ff)'
}, {
  id: 2,
  name: 'Rock',
  bg: 'linear-gradient(135deg, #ff4b2b, #ff416c)'
}, {
  id: 3,
  name: 'Pop',
  bg: 'linear-gradient(135deg, #f857a6, #ff5858)'
}, {
  id: 4,
  name: 'Electronic',
  bg: 'linear-gradient(135deg, #00c6ff, #0072ff)'
}, {
  id: 5,
  name: 'Hip Hop',
  bg: 'linear-gradient(135deg, #f12711, #f5af19)'
}, {
  id: 6,
  name: 'Jazz',
  bg: 'linear-gradient(135deg, #11998e, #38ef7d)'
}, {
  id: 7,
  name: 'Classical',
  bg: 'linear-gradient(135deg, #8e2de2, #4a00e0)'
}, {
  id: 8,
  name: 'Indie',
  bg: 'linear-gradient(135deg, #ff9966, #ff5e62)'
}];

// --- CONTEXT ---
const AppContext = createContext();

// --- UTILS ---
const formatTime = seconds => {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// --- COMPONENTS ---

const Toast = ({
  message,
  show,
  onClose
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  if (!show) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "toast-container position-fixed bottom-0 end-0 p-4 animate__animated animate__fadeInUp",
    style: {
      zIndex: 9999
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "toast show",
    role: "alert",
    style: {
      background: 'rgba(0, 20, 20, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--accent)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "toast-body d-flex justify-content-between align-items-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-exclamation-circle text-accent me-2"
  }), message), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-close btn-close-white",
    onClick: onClose
  }))));
};
const Sidebar = () => {
  const {
    setView,
    currentView,
    user,
    logout,
    setAuthModal,
    userPlaylists,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useContext(AppContext);
  useEffect(() => {
    $('.sidebar').hide().slideDown(400);
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, mobileMenuOpen && /*#__PURE__*/React.createElement("div", {
    className: "mobile-overlay d-md-none",
    onClick: () => setMobileMenuOpen(false)
  }), /*#__PURE__*/React.createElement("div", {
    className: `sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo position-relative",
    onClick: () => {
      setView({
        name: 'home'
      });
      setMobileMenuOpen(false);
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "/static/assets/audicore-logo.webp",
    alt: "Audicore",
    style: {
      height: 36,
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "logo-text"
  }, "Audicore"), mobileMenuOpen && /*#__PURE__*/React.createElement("i", {
    className: "bi bi-x-lg position-absolute d-md-none text-white",
    style: {
      right: 24,
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      fontSize: '1.5rem'
    },
    onClick: e => {
      e.stopPropagation();
      setMobileMenuOpen(false);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-4"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: `nav-item ${currentView.name === 'home' ? 'active' : ''}`,
    onClick: e => {
      e.preventDefault();
      setView({
        name: 'home'
      });
      setMobileMenuOpen(false);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-house-door-fill fs-5"
  }), " Home"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: `nav-item ${currentView.name === 'search' ? 'active' : ''}`,
    onClick: e => {
      e.preventDefault();
      setView({
        name: 'search'
      });
      setMobileMenuOpen(false);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-search fs-5"
  }), " Search"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: `nav-item ${currentView.name === 'library' ? 'active' : ''}`,
    onClick: e => {
      e.preventDefault();
      if (user) {
        setView({
          name: 'library'
        });
        setMobileMenuOpen(false);
      } else {
        setAuthModal('login');
      }
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-collection-play-fill fs-5"
  }), " Your Library")), user && /*#__PURE__*/React.createElement("div", {
    className: "mt-4 px-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label mb-3"
  }, "Playlists"), userPlaylists && userPlaylists.map(p => /*#__PURE__*/React.createElement("a", {
    key: p.id,
    className: "nav-item px-0 py-2",
    onClick: () => {
      setView({
        name: 'detail',
        type: 'playlist',
        id: p.id,
        data: p
      });
      setMobileMenuOpen(false);
    }
  }, p.title))), /*#__PURE__*/React.createElement("div", {
    className: "mt-auto p-4 border-top",
    style: {
      borderColor: 'var(--border)'
    }
  }, user ? /*#__PURE__*/React.createElement("div", {
    className: "d-flex align-items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-circle bg-accent d-flex justify-content-center align-items-center",
    style: {
      width: 32,
      height: 32,
      color: '#fff',
      fontWeight: 'bold'
    }
  }, user.username.charAt(0).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "text-truncate",
    style: {
      flex: 1,
      fontSize: '14px'
    }
  }, user.username), /*#__PURE__*/React.createElement("button", {
    className: "control-btn",
    onClick: logout,
    title: "Log Out"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-box-arrow-right"
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "d-grid gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline-light btn-sm rounded-pill",
    onClick: () => setAuthModal('register')
  }, "Sign Up"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-accent btn-sm rounded-pill",
    onClick: () => setAuthModal('login')
  }, "Log In")))));
};
const PlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    queue,
    queueIndex,
    setQueueIndex,
    likeSong,
    likedSongs
  } = useContext(AppContext);
  const audioRef = useRef(new Audio());
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // none, all, one

  // Use a ref to access latest state inside the ended event listener without stale closures
  const stateRef = useRef({
    queue,
    queueIndex,
    repeat,
    shuffle,
    isPlaying
  });
  useEffect(() => {
    stateRef.current = {
      queue,
      queueIndex,
      repeat,
      shuffle,
      isPlaying
    };
  }, [queue, queueIndex, repeat, shuffle, isPlaying]);
  useEffect(() => {
    audioRef.current.loop = repeat === 'one';
  }, [repeat]);
  const handleNext = useCallback(() => {
    const {
      queue,
      queueIndex,
      repeat,
      shuffle
    } = stateRef.current;
    if (!queue.length) return;
    let nextIdx = queueIndex + 1;
    if (nextIdx >= queue.length) {
      nextIdx = repeat === 'all' ? 0 : queue.length - 1;
      if (repeat === 'none' && nextIdx === queue.length - 1) {
        setIsPlaying(false);
        return;
      }
    }
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    }
    setQueueIndex(nextIdx);
    setIsPlaying(true);
  }, [setIsPlaying, setQueueIndex]);
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleNext);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleNext);
    };
  }, [volume, handleNext]);
  const lastSongIdRef = useRef(null);
  useEffect(() => {
    if (currentSong) {
      const audio = audioRef.current;
      // Only update src and load if the song actually changed
      if (lastSongIdRef.current !== currentSong.id) {
        setProgress(0);
        audio.src = `/api/v1/stream/${currentSong.id}`;
        audio.load();
        lastSongIdRef.current = currentSong.id;
        // Log play via authenticated fetch (audio element can't send auth headers)
        const token = localStorage.getItem('access_token');
        if (token) {
          fetch(`/api/v1/stream/${currentSong.id}/play`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).catch(() => {});
        }
      }
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log('Autoplay prevented', e));
        }
      } else {
        audio.pause();
      }
    }
  }, [currentSong, isPlaying]);
  const handlePlayPause = () => {
    if (!currentSong) return;
    setIsPlaying(!isPlaying);
  };
  const handlePrev = () => {
    if (!queue.length) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) prevIdx = queue.length - 1;
    setQueueIndex(prevIdx);
    setIsPlaying(true);
  };
  const handleSeek = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };
  const handleVolume = e => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioRef.current.volume = val;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "player-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "player-left d-flex align-items-center gap-3"
  }, currentSong ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    src: currentSong.cover || currentSong.cover_url,
    alt: "cover",
    className: `player-cover ${isPlaying ? 'cover-spin' : ''}`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-title text-truncate d-flex align-items-center",
    style: {
      fontSize: 14
    }
  }, currentSong.title, isPlaying && /*#__PURE__*/React.createElement("div", {
    className: "mini-eq d-none d-md-flex"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null))), /*#__PURE__*/React.createElement("div", {
    className: "card-subtitle text-truncate",
    style: {
      fontSize: 12
    }
  }, currentSong.artist || currentSong.artist_name)), /*#__PURE__*/React.createElement("button", {
    className: "control-btn ms-2",
    onClick: () => likeSong(currentSong.id)
  }, /*#__PURE__*/React.createElement("i", {
    className: `bi ${likedSongs.has(currentSong.id) ? 'bi-heart-fill text-green' : 'bi-heart'}`
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "text-muted",
    style: {
      fontSize: 12
    }
  }, "No track playing")), /*#__PURE__*/React.createElement("div", {
    className: "player-center d-flex flex-column align-items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex align-items-center gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    className: `control-btn ${shuffle ? 'active' : ''}`,
    onClick: () => setShuffle(!shuffle)
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-shuffle"
  })), /*#__PURE__*/React.createElement("button", {
    className: "control-btn fs-4",
    onClick: handlePrev
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-skip-start-fill"
  })), /*#__PURE__*/React.createElement("button", {
    className: "play-btn",
    onClick: handlePlayPause
  }, /*#__PURE__*/React.createElement("i", {
    className: `bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`
  })), /*#__PURE__*/React.createElement("button", {
    className: "control-btn fs-4",
    onClick: handleNext
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-skip-end-fill"
  })), /*#__PURE__*/React.createElement("button", {
    className: `control-btn ${repeat !== 'none' ? 'active' : ''}`,
    onClick: () => {
      if (repeat === 'none') setRepeat('all');else if (repeat === 'all') setRepeat('one');else setRepeat('none');
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `bi ${repeat === 'one' ? 'bi-repeat-1' : 'bi-repeat'}`
  }))), /*#__PURE__*/React.createElement("div", {
    className: "progress-container"
  }, /*#__PURE__*/React.createElement("span", null, formatTime(progress)), /*#__PURE__*/React.createElement("div", {
    className: "progress-bar-custom",
    onClick: handleSeek,
    onTouchEnd: handleSeek,
    onTouchMove: handleSeek,
    style: {
      padding: '10px 0',
      margin: '-10px 0',
      boxSizing: 'content-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-fill",
    style: {
      width: `${duration ? progress / duration * 100 : 0}%`
    }
  })), /*#__PURE__*/React.createElement("span", null, formatTime(duration)))), /*#__PURE__*/React.createElement("div", {
    className: "player-right d-flex justify-content-end align-items-center gap-2 pe-3"
  }, /*#__PURE__*/React.createElement("i", {
    className: `bi ${volume === 0 ? 'bi-volume-mute' : volume < 0.5 ? 'bi-volume-down' : 'bi-volume-up'} text-muted`
  }), /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "vol-slider",
    min: "0",
    max: "1",
    step: "0.01",
    value: volume,
    onChange: handleVolume
  })));
};
const MusicCard = ({
  item,
  data,
  type,
  delay = 0
}) => {
  const {
    setView,
    playSong,
    dynamicTrending
  } = useContext(AppContext);
  const actualData = item || data;
  const handleClick = () => {
    if (type === 'song') {
      // Play instantly and load the full trending list into the queue
      const fullDataSong = {
        ...actualData,
        audio: actualData.audio || actualData.file_path,
        cover: actualData.cover || actualData.cover_url
      };
      playSong(fullDataSong, dynamicTrending);
    } else {
      setView({
        name: 'detail',
        type,
        id: actualData.id,
        data: actualData
      });
    }
  };
  const handleHover = e => {
    $(e.currentTarget).addClass('hovered');
  };
  const handleLeave = e => {
    $(e.currentTarget).removeClass('hovered');
  };
  return /*#__PURE__*/React.createElement("div", {
    className: `music-card animate__animated animate__fadeInUp ${type === 'artist' ? 'artist-card' : ''}`,
    style: {
      animationDelay: `${delay}s`
    },
    onClick: handleClick,
    onMouseEnter: handleHover,
    onMouseLeave: handleLeave
  }, /*#__PURE__*/React.createElement("img", {
    src: actualData.cover_url || actualData.cover || actualData.image,
    alt: actualData.title || actualData.stage_name || actualData.name
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card-title"
  }, actualData.title || actualData.stage_name || actualData.name), /*#__PURE__*/React.createElement("div", {
    className: "card-subtitle"
  }, actualData.artist_name || actualData.artist || (type === 'artist' ? 'Artist' : 'Album'))));
};
const SongRow = ({
  song,
  index,
  songsArray,
  onDeleteSong,
  onRemoveFromPlaylist
}) => {
  const {
    currentSong,
    isPlaying,
    playSong,
    likeSong,
    likedSongs,
    setAddToPlaylistModal
  } = useContext(AppContext);
  const isCurrent = currentSong?.id === song.id;
  return /*#__PURE__*/React.createElement("div", {
    className: `song-row ${isCurrent ? 'active' : ''}`,
    onDoubleClick: () => playSong(song, songsArray)
  }, /*#__PURE__*/React.createElement("div", {
    className: "position-relative d-flex justify-content-center align-items-center",
    style: {
      width: 40
    }
  }, isCurrent && isPlaying ? /*#__PURE__*/React.createElement("div", {
    className: "d-flex align-items-end h-50 eq-bars-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eq-bar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "eq-bar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "eq-bar"
  })) : /*#__PURE__*/React.createElement("span", {
    className: "row-num"
  }, index + 1), /*#__PURE__*/React.createElement("i", {
    className: "bi bi-play-fill row-play-btn",
    onClick: e => {
      e.stopPropagation();
      playSong(song, songsArray);
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: song.cover || song.cover_url,
    alt: "cover"
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-truncate"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: isCurrent ? 'var(--green)' : 'var(--text-primary)'
    }
  }, song.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14
    }
  }, song.artist_name || song.artist)), /*#__PURE__*/React.createElement("div", {
    className: "row-album text-truncate"
  }, song.album_title || song.album), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-end align-items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-actions"
  }, /*#__PURE__*/React.createElement("i", {
    className: `bi ${likedSongs.has(song.id) ? 'bi-heart-fill text-green' : 'bi-heart'}`,
    onClick: e => {
      e.stopPropagation();
      likeSong(song.id);
    }
  }), /*#__PURE__*/React.createElement("i", {
    className: "bi bi-plus-circle",
    title: "Add to playlist",
    onClick: e => {
      e.stopPropagation();
      setAddToPlaylistModal(song);
    }
  }), onRemoveFromPlaylist && /*#__PURE__*/React.createElement("i", {
    className: "bi bi-dash-circle text-warning ms-2",
    title: "Remove from playlist",
    onClick: e => {
      e.stopPropagation();
      onRemoveFromPlaylist(song.id);
    }
  }), onDeleteSong && /*#__PURE__*/React.createElement("i", {
    className: "bi bi-trash text-danger ms-2",
    title: "Delete song",
    onClick: e => {
      e.stopPropagation();
      onDeleteSong(song.id);
    }
  })), /*#__PURE__*/React.createElement("span", null, formatTime(song.duration_secs || song.duration))));
};
const HomeView = () => {
  const {
    dynamicArtists,
    dynamicAlbums,
    dynamicTrending,
    setView,
    dynamicAllSongs
  } = useContext(AppContext);
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "animate__animated animate__fadeIn"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "hero-text mb-5"
  }, getGreeting()), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between align-items-end mb-3"
  }, /*#__PURE__*/React.createElement("h2", null, "Trending Now"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      setView({
        name: 'detail',
        type: 'playlist',
        id: 'trending',
        data: {
          title: 'Trending Now',
          songs: dynamicTrending,
          cover_url: dynamicTrending[0]?.cover_url,
          artist: 'Audicore'
        }
      });
    },
    className: "text-accent text-decoration-none"
  }, "See all")), /*#__PURE__*/React.createElement("div", {
    className: "horizontal-scroll mb-5"
  }, dynamicTrending.map((song, idx) => /*#__PURE__*/React.createElement(MusicCard, {
    key: song.id,
    item: song,
    type: "song",
    delay: idx * 0.05
  }))), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between align-items-end mb-3"
  }, /*#__PURE__*/React.createElement("h2", null, "Featured Albums"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      setView({
        name: 'category',
        type: 'albums'
      });
    },
    className: "text-accent text-decoration-none"
  }, "See all")), /*#__PURE__*/React.createElement("div", {
    className: "horizontal-scroll mb-5"
  }, dynamicAlbums.map((album, idx) => /*#__PURE__*/React.createElement(MusicCard, {
    key: album.id,
    item: album,
    type: "album",
    delay: idx * 0.05
  }))), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between align-items-end mb-3"
  }, /*#__PURE__*/React.createElement("h2", null, "Browse Artists"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      setView({
        name: 'category',
        type: 'artists'
      });
    },
    className: "text-accent text-decoration-none"
  }, "See all")), /*#__PURE__*/React.createElement("div", {
    className: "horizontal-scroll mb-5"
  }, dynamicArtists.map((artist, idx) => /*#__PURE__*/React.createElement(MusicCard, {
    key: artist.id,
    item: artist,
    type: "artist",
    delay: idx * 0.05
  }))));
};
const SearchView = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      $.ajax({
        url: `/api/v1/search/?q=${encodeURIComponent(query)}`,
        type: 'GET',
        success: data => {
          setResults({
            songs: data.songs || [],
            albums: data.albums || [],
            artists: data.artists || []
          });
        },
        error: () => console.error("Search failed")
      });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);
  return /*#__PURE__*/React.createElement("div", {
    className: "animate__animated animate__fadeIn"
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-group mb-5 shadow-lg",
    style: {
      maxWidth: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "input-group-text bg-card border-0 text-muted"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-search"
  })), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control border-0 py-3 bg-card text-primary",
    placeholder: "What do you want to listen to?",
    style: {
      fontSize: 18
    },
    value: query,
    onChange: e => setQuery(e.target.value)
  })), !results ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    className: "mb-4"
  }, "Browse All"), /*#__PURE__*/React.createElement("div", {
    className: "row g-4"
  }, MOCK_GENRES.map((g, idx) => /*#__PURE__*/React.createElement("div", {
    key: g.id,
    className: "col-6 col-md-4 col-lg-3 animate__animated animate__zoomIn",
    style: {
      animationDelay: `${idx * 0.05}s`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "genre-tile",
    style: {
      background: g.bg,
      cursor: 'pointer'
    },
    onClick: () => setQuery(g.name)
  }, g.name))))) : /*#__PURE__*/React.createElement("div", {
    className: "row g-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-12 col-xl-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "mb-3"
  }, "Songs"), results.songs.length ? results.songs.slice(0, 5).map((s, i) => /*#__PURE__*/React.createElement(SongRow, {
    key: s.id,
    song: s,
    index: i,
    songsArray: results.songs
  })) : /*#__PURE__*/React.createElement("p", {
    className: "text-muted"
  }, "No songs found.")), /*#__PURE__*/React.createElement("div", {
    className: "col-12 col-xl-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "mb-3"
  }, "Albums & Artists"), /*#__PURE__*/React.createElement("div", {
    className: "horizontal-scroll"
  }, results.albums.map(a => /*#__PURE__*/React.createElement(MusicCard, {
    key: a.id,
    item: a,
    type: "album"
  })), results.artists.map(a => /*#__PURE__*/React.createElement(MusicCard, {
    key: a.id,
    item: a,
    type: "artist"
  }))), !results.albums.length && !results.artists.length && /*#__PURE__*/React.createElement("p", {
    className: "text-muted"
  }, "No albums or artists found."))));
};
const LibraryView = () => {
  const [tab, setTab] = useState('playlists');
  const [uploadMode, setUploadMode] = useState('youtube');
  const {
    likedSongs,
    user,
    setAuthModal,
    showToast,
    userPlaylists,
    setPlaylistModal,
    dynamicAllSongs,
    fetchAllSongs,
    mySongs,
    fetchMySongs
  } = useContext(AppContext);
  return /*#__PURE__*/React.createElement("div", {
    className: "animate__animated animate__fadeIn h-100 d-flex flex-column"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "mb-4"
  }, "Your Library"), /*#__PURE__*/React.createElement("ul", {
    className: "nav nav-tabs mb-4"
  }, /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement("a", {
    className: `nav-link ${tab === 'playlists' ? 'active' : ''}`,
    onClick: () => setTab('playlists')
  }, "Playlists")), /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement("a", {
    className: `nav-link ${tab === 'liked' ? 'active' : ''}`,
    onClick: () => setTab('liked')
  }, "Liked Songs")), /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement("a", {
    className: `nav-link ${tab === 'mysongs' ? 'active' : ''}`,
    onClick: () => setTab('mysongs')
  }, "My Songs")), /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement("a", {
    className: `nav-link ${tab === 'upload' ? 'active' : ''}`,
    onClick: () => setTab('upload')
  }, "Upload"))), /*#__PURE__*/React.createElement("div", {
    className: "flex-grow-1 position-relative"
  }, tab === 'playlists' && /*#__PURE__*/React.createElement("div", {
    className: "row g-4 animate__animated animate__fadeIn"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-6 col-md-4 col-lg-3 col-xl-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "music-card d-flex flex-column justify-content-center align-items-center h-100",
    style: {
      minHeight: '220px',
      border: '2px dashed var(--border)',
      background: 'transparent'
    },
    onClick: () => {
      user ? setPlaylistModal(true) : setAuthModal('login');
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-plus-circle text-accent",
    style: {
      fontSize: '48px'
    }
  }), /*#__PURE__*/React.createElement("h5", {
    className: "mt-3 text-primary"
  }, "Create Playlist"))), userPlaylists && userPlaylists.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "col-6 col-md-4 col-lg-3 col-xl-2"
  }, /*#__PURE__*/React.createElement(MusicCard, {
    item: p,
    type: "playlist"
  }))), !user && /*#__PURE__*/React.createElement("p", {
    className: "text-muted w-100 mt-4"
  }, "Sign in to see your playlists.")), tab === 'liked' && /*#__PURE__*/React.createElement("div", {
    className: "animate__fadeIn"
  }, /*#__PURE__*/React.createElement("div", {
    className: "song-row text-uppercase label",
    style: {
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", null, "#"), /*#__PURE__*/React.createElement("div", null, "Title"), /*#__PURE__*/React.createElement("div", {
    className: "row-album"
  }, "Album"), /*#__PURE__*/React.createElement("div", {
    className: "text-end"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-clock"
  }))), dynamicAllSongs && dynamicAllSongs.filter(s => likedSongs.has(s.id)).map((s, i, arr) => /*#__PURE__*/React.createElement(SongRow, {
    key: s.id,
    song: s,
    index: i,
    songsArray: arr
  })), likedSongs.size === 0 && /*#__PURE__*/React.createElement("p", {
    className: "text-muted mt-4 text-center"
  }, "Songs you like will appear here.")), tab === 'mysongs' && /*#__PURE__*/React.createElement("div", {
    className: "animate__fadeIn"
  }, /*#__PURE__*/React.createElement("div", {
    className: "song-row text-uppercase label",
    style: {
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", null, "#"), /*#__PURE__*/React.createElement("div", null, "Title"), /*#__PURE__*/React.createElement("div", {
    className: "row-album"
  }, "Album"), /*#__PURE__*/React.createElement("div", {
    className: "text-end"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-clock"
  }))), mySongs && mySongs.map((s, i, arr) => /*#__PURE__*/React.createElement(SongRow, {
    key: s.id,
    song: s,
    index: i,
    songsArray: arr,
    onDeleteSong: songId => {
      if (!confirm("Are you sure you want to permanently delete this song?")) return;
      $.ajax({
        url: `/api/v1/songs/${songId}`,
        type: 'DELETE',
        success: () => {
          showToast('Song deleted');
          fetchMySongs();
          fetchAllSongs();
        },
        error: xhr => showToast(xhr.responseJSON?.error || 'Failed to delete song')
      });
    }
  })), (!mySongs || mySongs.length === 0) && /*#__PURE__*/React.createElement("p", {
    className: "text-muted mt-4 text-center"
  }, "You haven't uploaded any songs yet.")), tab === 'upload' && /*#__PURE__*/React.createElement("div", {
    className: "animate__fadeIn mt-4",
    style: {
      maxWidth: '600px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4",
    style: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between align-items-center mb-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "mb-0"
  }, "Add a Track"), user && /*#__PURE__*/React.createElement("div", {
    className: "btn-group",
    role: "group"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `btn btn-sm ${uploadMode === 'youtube' ? 'btn-accent text-dark fw-bold' : 'btn-outline-light'}`,
    onClick: () => setUploadMode('youtube')
  }, "YouTube"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `btn btn-sm ${uploadMode === 'file' ? 'btn-accent text-dark fw-bold' : 'btn-outline-light'}`,
    onClick: () => setUploadMode('file')
  }, "Local File"))), !user ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-muted mb-4"
  }, "You must be logged in to add tracks."), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary px-4 rounded-pill",
    onClick: () => setAuthModal('login')
  }, "Log In")) : uploadMode === 'youtube' ? /*#__PURE__*/React.createElement("form", {
    onSubmit: async e => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      const originalBtnHtml = submitBtn.innerHTML;
      const setBtnState = text => {
        submitBtn.innerHTML = `<div class="d-flex justify-content-center align-items-center gap-2"><div class="spinner-grow spinner-grow-sm text-light" role="status"></div><div class="spinner-grow spinner-grow-sm text-light" role="status" style="animation-delay: 0.2s"></div><div class="spinner-grow spinner-grow-sm text-light" role="status" style="animation-delay: 0.4s"></div><span class="ms-2 fw-bold">${text}</span></div>`;
      };
      try {
        setBtnState("Resolving Link...");
        const resolveData = await $.ajax({
          url: '/api/v1/songs/yt-resolve',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(Object.fromEntries(formData))
        });
        setBtnState("Downloading Audio...");
        const audioResp = await fetch(resolveData.download_link);
        if (!audioResp.ok) throw new Error("Blocked by CDN");
        const audioBlob = await audioResp.blob();
        let coverBlob = null;
        if (resolveData.thumbnail) {
          try {
            const coverResp = await fetch(resolveData.thumbnail);
            if (coverResp.ok) coverBlob = await coverResp.blob();
          } catch (e) {
            console.warn("Cover download skipped due to CORS.");
          }
        }
        setBtnState("Uploading...");
        const uploadData = new FormData();
        uploadData.append('audio_file', audioBlob, 'audio.mp3');
        if (coverBlob) uploadData.append('cover_file', coverBlob, 'cover.jpg');
        uploadData.append('title', resolveData.title);
        uploadData.append('is_published', 'true');
        await $.ajax({
          url: '/api/v1/songs/upload',
          type: 'POST',
          data: uploadData,
          processData: false,
          contentType: false
        });
        showToast('Song imported successfully!');
        e.target.reset();
        fetchAllSongs();
        fetchMySongs();
      } catch (err) {
        const msg = err.responseJSON?.error || err.message || 'Unknown error';
        showToast('Import failed: ' + msg);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label text-muted small text-uppercase"
  }, "YouTube URL"), /*#__PURE__*/React.createElement("input", {
    type: "url",
    name: "youtube_url",
    className: "form-control",
    placeholder: "https://www.youtube.com/watch?v=...",
    style: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid var(--border)',
      color: 'var(--text-primary)'
    },
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb-5"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label text-muted small text-uppercase"
  }, "Track Title (Optional)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "title",
    className: "form-control",
    placeholder: "Leave blank to use YouTube title",
    style: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid var(--border)',
      color: 'var(--text-primary)'
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary w-100 py-3 rounded-pill fw-bold"
  }, "Import from YouTube")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="d-flex align-items-center justify-content-center gap-2"><div class="spinner-grow spinner-grow-sm text-light" role="status"></div><div class="spinner-grow spinner-grow-sm text-light" role="status" style="animation-delay: 0.2s"></div><div class="spinner-grow spinner-grow-sm text-light" role="status" style="animation-delay: 0.4s"></div><span class="ms-2 fw-bold">Uploading...</span></div>';
      const formData = new FormData(e.target);
      $.ajax({
        url: '/api/v1/songs/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: () => {
          showToast('Song uploaded successfully!');
          e.target.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Upload Track';
          fetchAllSongs();
          fetchMySongs();
        },
        error: xhr => {
          showToast('Upload failed: ' + (xhr.responseJSON?.error || 'Unknown error'));
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Upload Track';
        }
      });
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label text-muted small text-uppercase"
  }, "Track Title"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "title",
    className: "form-control",
    style: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid var(--border)',
      color: 'var(--text-primary)'
    },
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label text-muted small text-uppercase"
  }, "Audio File (MP3/FLAC)"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    name: "audio_file",
    accept: "audio/*",
    className: "form-control",
    style: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid var(--border)',
      color: 'var(--text-primary)'
    },
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb-5"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label text-muted small text-uppercase"
  }, "Cover Art (Optional Image)"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    name: "cover_file",
    accept: "image/*",
    className: "form-control",
    style: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid var(--border)',
      color: 'var(--text-primary)'
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary w-100 py-3 rounded-pill fw-bold"
  }, "Upload Track"))))));
};
const CategoryView = () => {
  const {
    currentView,
    dynamicAlbums,
    dynamicArtists,
    dynamicAllSongs
  } = useContext(AppContext);
  const {
    type
  } = currentView;
  let title, items, cardType;
  if (type === 'albums') {
    title = 'Featured Albums';
    items = dynamicAlbums;
    cardType = 'album';
  } else if (type === 'songs') {
    title = 'New Releases';
    items = dynamicAllSongs;
    cardType = 'song';
  } else {
    title = 'Browse Artists';
    items = dynamicArtists;
    cardType = 'artist';
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "animate__animated animate__fadeIn"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "hero-text mb-5"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "row g-4"
  }, items.map((item, idx) => /*#__PURE__*/React.createElement("div", {
    key: item.id,
    className: "col-6 col-md-4 col-lg-3 col-xl-2"
  }, /*#__PURE__*/React.createElement(MusicCard, {
    item: item,
    type: cardType,
    delay: idx * 0.05
  })))));
};
const DetailView = () => {
  const {
    detailContext,
    playSong,
    user,
    showToast,
    fetchUserPlaylists,
    setView
  } = useContext(AppContext);
  const {
    type,
    data
  } = detailContext;
  const [songs, setSongs] = useState([]);
  useEffect(() => {
    if (type === 'album') {
      $.ajax({
        url: `/api/v1/albums/${data.id}`,
        type: 'GET',
        success: res => {
          setSongs(res.songs.map(s => ({
            ...s,
            audio: s.file_path,
            cover: s.cover_url || res.album.cover_url,
            album_title: res.album.title,
            artist_name: res.album.artist_name
          })));
        }
      });
    } else if (type === 'song') {
      setSongs([{
        ...data,
        audio: data.audio || data.file_path,
        cover: data.cover || data.cover_url
      }]);
    } else {
      setSongs(data.songs || []);
    }
  }, [type, data.id]);
  const handlePlayAll = () => {
    if (songs.length) playSong(songs[0], songs);
  };
  const handleDeletePlaylist = () => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    $.ajax({
      url: `/api/v1/playlists/${data.id}`,
      type: 'DELETE',
      success: () => {
        showToast('Playlist deleted');
        fetchUserPlaylists();
        setView({
          name: 'library'
        });
      },
      error: xhr => showToast(xhr.responseJSON?.error || 'Failed to delete playlist')
    });
  };
  const handleRemoveFromPlaylist = songId => {
    $.ajax({
      url: `/api/v1/playlists/${data.id}/songs/${songId}`,
      type: 'DELETE',
      success: res => {
        showToast('Song removed');
        setSongs(songs.filter(s => s.id !== songId));
        detailContext.data.songs = res.songs;
      },
      error: xhr => showToast(xhr.responseJSON?.error || 'Failed to remove song')
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "animate__animated animate__fadeIn"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-bg",
    style: {
      backgroundImage: `url(${data.cover_url || data.cover || data.image})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-content"
  }, /*#__PURE__*/React.createElement("img", {
    src: data.cover_url || data.cover || data.image,
    className: "hero-cover",
    alt: "cover"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "label mb-2"
  }, type), /*#__PURE__*/React.createElement("h1", {
    className: `hero-text mb-3 ${type === 'artist' ? 'detail-hero-text' : ''}`
  }, data.title || data.name), /*#__PURE__*/React.createElement("div", {
    className: "d-flex align-items-center gap-3 text-muted"
  }, type === 'album' && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "text-primary fw-bold"
  }, data.artist_name || data.artist), " \u2022 ", songs.length, " songs"), type === 'playlist' && /*#__PURE__*/React.createElement("span", null, "Created by ", /*#__PURE__*/React.createElement("span", {
    className: "text-primary fw-bold"
  }, data.owner_name), " \u2022 ", songs.length, " songs"))))), /*#__PURE__*/React.createElement("div", {
    className: "mb-4 d-flex align-items-center gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    className: "play-btn d-inline-flex",
    style: {
      width: 56,
      height: 56,
      fontSize: 28
    },
    onClick: handlePlayAll,
    title: "Play All"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-play-fill"
  })), /*#__PURE__*/React.createElement("button", {
    className: "control-btn fs-2",
    onClick: () => {
      if (songs.length) {
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        playSong(shuffled[0], shuffled);
      }
    },
    title: "Shuffle Play"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-shuffle"
  })), type === 'playlist' && user && data.owner_id === user.id && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline-danger px-4 rounded-pill fw-bold",
    onClick: handleDeletePlaylist
  }, "Delete Playlist")), /*#__PURE__*/React.createElement("div", {
    className: "song-row text-uppercase label",
    style: {
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", null, "#"), /*#__PURE__*/React.createElement("div", null, "Title"), /*#__PURE__*/React.createElement("div", {
    className: "row-album"
  }, "Album"), /*#__PURE__*/React.createElement("div", {
    className: "text-end"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-clock"
  }))), songs.map((song, i) => /*#__PURE__*/React.createElement(SongRow, {
    key: song.id,
    song: song,
    index: i,
    songsArray: songs,
    onRemoveFromPlaylist: type === 'playlist' && user && data.owner_id === user.id ? handleRemoveFromPlaylist : null
  })), songs.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "text-muted mt-4 text-center"
  }, "No songs found."));
};
const AuthModal = () => {
  const {
    authModal,
    setAuthModal,
    setUser,
    showToast
  } = useContext(AppContext);
  const isLogin = authModal === 'login';
  const handleSubmit = e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    $.ajax({
      url: isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: res => {
        if (res.access_token) {
          localStorage.setItem('access_token', res.access_token);
          $.ajaxSetup({
            headers: {
              'Authorization': `Bearer ${res.access_token}`
            }
          });
        }
        if (res.user) setUser(res.user);
        setAuthModal(null);
      },
      error: xhr => {
        showToast('Authentication failed');
      }
    });
  };
  if (!authModal) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "modal d-block",
    style: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(5px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog modal-dialog-centered"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-content original-theme animate__animated animate__zoomIn animate__faster"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header d-flex flex-column align-items-center position-relative"
  }, /*#__PURE__*/React.createElement("h5", {
    className: "modal-title"
  }, isLogin ? 'Log In' : 'Sign Up'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-close btn-close-white position-absolute top-0 end-0 m-3",
    onClick: () => setAuthModal(null)
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal-body p-4"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, !isLogin && /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label label"
  }, "Username"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "username",
    className: "form-control",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label label"
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    name: "email",
    className: "form-control",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label label"
  }, "Password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    name: "password",
    className: "form-control",
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-accent w-100 py-2 mb-3"
  }, isLogin ? 'Log In' : 'Sign Up'))))));
};
const CreatePlaylistModal = () => {
  const {
    playlistModal,
    setPlaylistModal,
    showToast,
    fetchUserPlaylists
  } = useContext(AppContext);
  if (!playlistModal) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "modal d-block",
    style: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(5px)',
      zIndex: 1060
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog modal-dialog-centered"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-content original-theme animate__animated animate__zoomIn animate__faster"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header d-flex flex-column align-items-center position-relative"
  }, /*#__PURE__*/React.createElement("h5", {
    className: "modal-title"
  }, "Create Playlist"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-close btn-close-white position-absolute top-0 end-0 m-3",
    onClick: () => setPlaylistModal(false)
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal-body p-4"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      $.ajax({
        url: '/api/v1/playlists/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: () => {
          showToast('Playlist created!');
          setPlaylistModal(false);
          fetchUserPlaylists();
        },
        error: () => showToast('Failed to create playlist')
      });
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label label"
  }, "Playlist Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "title",
    className: "form-control",
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-accent w-100 py-2"
  }, "Create"))))));
};
const AddToPlaylistModal = () => {
  const {
    addToPlaylistModal,
    setAddToPlaylistModal,
    showToast,
    userPlaylists
  } = useContext(AppContext);
  if (!addToPlaylistModal) return null;
  const song = addToPlaylistModal;
  return /*#__PURE__*/React.createElement("div", {
    className: "modal d-block",
    style: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(5px)',
      zIndex: 1060
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog modal-dialog-centered"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-content original-theme animate__animated animate__zoomIn animate__faster"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header d-flex flex-column align-items-center position-relative"
  }, /*#__PURE__*/React.createElement("h5", {
    className: "modal-title"
  }, "Add to Playlist"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-close btn-close-white position-absolute top-0 end-0 m-3",
    onClick: () => setAddToPlaylistModal(null)
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal-body p-4 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-muted mb-4"
  }, "Select a playlist for ", /*#__PURE__*/React.createElement("strong", null, song.title), ":"), !userPlaylists || userPlaylists.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-muted"
  }, "You don't have any playlists yet.") : /*#__PURE__*/React.createElement("div", {
    className: "d-grid gap-2"
  }, userPlaylists.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    className: "btn btn-outline-light text-start py-2",
    onClick: () => {
      $.ajax({
        url: `/api/v1/playlists/${p.id}/songs`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          song_id: song.id
        }),
        success: () => {
          showToast(`Added to ${p.title}`);
          setAddToPlaylistModal(null);
        },
        error: xhr => showToast(xhr.responseJSON?.error || 'Failed to add song')
      });
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-music-note-list me-3"
  }), " ", p.title)))))));
};
const App = () => {
  const [currentView, setView] = useState({
    name: 'home'
  });
  const [detailContext, setDetailContext] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentSong = queue[queueIndex] || null;
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [toast, setToast] = useState({
    show: false,
    msg: ''
  });
  const [dynamicArtists, setDynamicArtists] = useState([]);
  const [dynamicAlbums, setDynamicAlbums] = useState([]);
  const [dynamicTrending, setDynamicTrending] = useState([]);
  const [dynamicAllSongs, setDynamicAllSongs] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistModal, setPlaylistModal] = useState(false);
  const [addToPlaylistModal, setAddToPlaylistModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mySongs, setMySongs] = useState([]);
  const fetchUserPlaylists = useCallback(() => {
    if (user) {
      $.ajax({
        url: '/api/v1/playlists/',
        type: 'GET',
        success: setUserPlaylists
      });
    } else {
      setUserPlaylists([]);
    }
  }, [user]);
  const fetchMySongs = useCallback(() => {
    if (user) {
      $.ajax({
        url: '/api/v1/songs/mine',
        type: 'GET',
        success: res => {
          setMySongs(res.map(s => ({
            ...s,
            audio: s.audio || s.file_path,
            cover: s.cover || s.cover_url
          })));
        }
      });
    } else {
      setMySongs([]);
    }
  }, [user]);
  const fetchAllSongs = useCallback(() => {
    $.ajax({
      url: '/api/v1/songs/',
      type: 'GET',
      success: res => {
        setDynamicAllSongs(res.map(s => ({
          ...s,
          audio: s.audio || s.file_path,
          cover: s.cover || s.cover_url
        })));
      }
    });
  }, []);
  useEffect(() => {
    fetchUserPlaylists();
    fetchMySongs();
  }, [fetchUserPlaylists, fetchMySongs]);
  useEffect(() => {
    $.ajax({
      url: '/api/v1/artists/',
      type: 'GET',
      success: setDynamicArtists
    });
    $.ajax({
      url: '/api/v1/albums/',
      type: 'GET',
      success: setDynamicAlbums
    });
    $.ajax({
      url: '/api/v1/songs/trending',
      type: 'GET',
      success: res => {
        setDynamicTrending(res.map(s => ({
          ...s,
          audio: s.audio || s.file_path,
          cover: s.cover || s.cover_url
        })));
      }
    });
    fetchAllSongs();
  }, [fetchAllSongs]);
  const showToast = msg => {
    setToast({
      show: true,
      msg
    });
    setTimeout(() => setToast({
      show: false,
      msg: ''
    }), 3000);
  };
  const handleSetView = viewObj => {
    if (viewObj.name === 'detail') setDetailContext(viewObj);
    setView(viewObj);
    window.history.pushState(viewObj, '', '?view=' + viewObj.name);
  };
  const playSong = (song, newQueue) => {
    setQueue(newQueue);
    setQueueIndex(newQueue.findIndex(s => s.id === song.id));
    setIsPlaying(true);
  };
  const likeSong = id => {
    setLikedSongs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else next.add(id);
      return next;
    });
  };
  const logout = () => {
    localStorage.removeItem('access_token');
    $.ajaxSetup({
      headers: {
        'Authorization': ''
      }
    });
    setUser(null);
    showToast('Logged out');
  };

  // Handle popstate for browser back button
  useEffect(() => {
    const handlePopState = e => {
      if (e.state && e.state.name) {
        if (e.state.name === 'detail') setDetailContext(e.state);
        setView(e.state);
      } else {
        setView({
          name: 'home'
        });
      }
    };
    window.addEventListener('popstate', handlePopState);
    // initialize first state
    window.history.replaceState({
      name: 'home'
    }, '', '?view=home');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      $.ajaxSetup({
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      $.ajax({
        url: '/api/v1/auth/me',
        type: 'GET',
        success: res => {
          if (res.user) setUser(res.user);
        },
        error: () => {
          localStorage.removeItem('access_token');
          $.ajaxSetup({
            headers: {
              'Authorization': ''
            }
          });
        }
      });
    }
  }, []);
  const contextValue = {
    currentView,
    setView: handleSetView,
    detailContext,
    playSong,
    currentSong,
    isPlaying,
    setIsPlaying,
    queue,
    queueIndex,
    setQueueIndex,
    user,
    setUser,
    authModal,
    setAuthModal,
    likedSongs,
    likeSong,
    showToast,
    logout,
    dynamicArtists,
    dynamicAlbums,
    dynamicTrending,
    dynamicAllSongs,
    fetchAllSongs,
    mySongs,
    fetchMySongs,
    userPlaylists,
    setUserPlaylists,
    fetchUserPlaylists,
    playlistModal,
    setPlaylistModal,
    addToPlaylistModal,
    setAddToPlaylistModal,
    mobileMenuOpen,
    setMobileMenuOpen
  };
  return /*#__PURE__*/React.createElement(AppContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement("div", {
    id: "app-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glow-layer glow1",
    style: {
      top: '30%',
      left: '20%'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "glow-layer glow2",
    style: {
      top: '60%',
      left: '80%'
    }
  }), /*#__PURE__*/React.createElement(Sidebar, null), /*#__PURE__*/React.createElement("div", {
    className: "main-area",
    id: "main-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-header d-md-none d-flex justify-content-between align-items-center w-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex align-items-center gap-2",
    style: {
      cursor: 'pointer'
    },
    onClick: () => setView({
      name: 'home'
    })
  }, /*#__PURE__*/React.createElement("img", {
    src: "/static/assets/audicore-logo.webp",
    alt: "Audicore Logo",
    style: {
      height: 30,
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "logo-text fw-bold fs-4",
    style: {
      fontFamily: 'Clash Display',
      margin: 0
    }
  }, "Audicore")), /*#__PURE__*/React.createElement("i", {
    className: "bi bi-list fs-1 text-white",
    style: {
      cursor: 'pointer'
    },
    onClick: () => setMobileMenuOpen(true)
  })), currentView.name === 'home' && /*#__PURE__*/React.createElement(HomeView, null), currentView.name === 'search' && /*#__PURE__*/React.createElement(SearchView, null), currentView.name === 'library' && /*#__PURE__*/React.createElement(LibraryView, null), currentView.name === 'category' && /*#__PURE__*/React.createElement(CategoryView, null), currentView.name === 'detail' && /*#__PURE__*/React.createElement(DetailView, null)), /*#__PURE__*/React.createElement(PlayerBar, null)), /*#__PURE__*/React.createElement(AuthModal, null), /*#__PURE__*/React.createElement(CreatePlaylistModal, null), /*#__PURE__*/React.createElement(AddToPlaylistModal, null), /*#__PURE__*/React.createElement(Toast, {
    message: toast.msg,
    show: toast.show,
    onClose: () => setToast({
      show: false,
      msg: ''
    })
  }));
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));

// Initialize tooltips (jQuery & Bootstrap)
$(function () {
  $('[data-bs-toggle="tooltip"]').tooltip();
});
