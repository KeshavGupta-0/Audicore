const { useState, useEffect, useRef, useCallback, useContext, createContext } = React;

    // --- MOCK DATA ---
    const MOCK_GENRES = [
      { id: 1, name: 'Synthwave', bg: 'linear-gradient(135deg, #00ffff, #0077ff)' },
      { id: 2, name: 'Rock', bg: 'linear-gradient(135deg, #ff4b2b, #ff416c)' },
      { id: 3, name: 'Pop', bg: 'linear-gradient(135deg, #f857a6, #ff5858)' },
      { id: 4, name: 'Electronic', bg: 'linear-gradient(135deg, #00c6ff, #0072ff)' },
      { id: 5, name: 'Hip Hop', bg: 'linear-gradient(135deg, #f12711, #f5af19)' },
      { id: 6, name: 'Jazz', bg: 'linear-gradient(135deg, #11998e, #38ef7d)' },
      { id: 7, name: 'Classical', bg: 'linear-gradient(135deg, #8e2de2, #4a00e0)' },
      { id: 8, name: 'Indie', bg: 'linear-gradient(135deg, #ff9966, #ff5e62)' },
    ];



    // --- CONTEXT ---
    const AppContext = createContext();

    // --- UTILS ---
    const formatTime = (seconds) => {
      if (isNaN(seconds)) return '0:00';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // --- COMPONENTS ---

    const Toast = ({ message, show, onClose }) => {
      useEffect(() => {
        if (show) {
          const timer = setTimeout(() => {
            onClose();
          }, 3500);
          return () => clearTimeout(timer);
        }
      }, [show, onClose]);

      if (!show) return null;
      return (
        <div className="toast-container position-fixed bottom-0 end-0 p-4 animate__animated animate__fadeInUp" style={{ zIndex: 9999 }}>
          <div className="toast show" role="alert" style={{ background: 'rgba(0, 20, 20, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid var(--accent)', color: '#fff' }}>
            <div className="toast-body d-flex justify-content-between align-items-center">
              <div><i className="bi bi-exclamation-circle text-accent me-2"></i>{message}</div>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
          </div>
        </div>
      );
    };

    const Sidebar = () => {
      const { setView, currentView, user, logout, setAuthModal, userPlaylists, mobileMenuOpen, setMobileMenuOpen } = useContext(AppContext);
      
      useEffect(() => {
        $('.sidebar').hide().slideDown(400);
      }, []);

      return (
        <>
          {mobileMenuOpen && <div className="mobile-overlay d-md-none" onClick={() => setMobileMenuOpen(false)}></div>}
          <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="logo position-relative" onClick={() => { setView({ name: 'home' }); setMobileMenuOpen(false); }}>
              <img src="/static/assets/audicore-logo.webp" alt="Audicore" style={{ height: 36, objectFit: 'contain' }} />
              <span className="logo-text">Audicore</span>
              {mobileMenuOpen && <i className="bi bi-x-lg position-absolute d-md-none text-white" style={{ right: 24, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.5rem' }} onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }}></i>}
            </div>
            
            <div className="mt-4">
              <a href="#" className={`sidebar-item ${currentView.name === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView({ name: 'home' }); setMobileMenuOpen(false); }}>
                <i className="bi bi-house-door-fill fs-5"></i> Home
              </a>
              <a href="#" className={`sidebar-item ${currentView.name === 'search' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView({ name: 'search' }); setMobileMenuOpen(false); }}>
                <i className="bi bi-search fs-5"></i> Search
              </a>
              <a href="#" className={`sidebar-item ${currentView.name === 'library' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); if (user) { setView({ name: 'library' }); setMobileMenuOpen(false); } else { setAuthModal('login'); } }}>
                <i className="bi bi-collection-play-fill fs-5"></i> Your Library
              </a>
            </div>

            {user && (
              <div className="mt-4 px-4">
                <div className="label mb-3">Playlists</div>
                {userPlaylists && userPlaylists.map(p => (
                  <a key={p.id} className="sidebar-item px-0 py-2" onClick={() => { setView({ name: 'detail', type: 'playlist', id: p.id, data: p }); setMobileMenuOpen(false); }}>
                    {p.title}
                  </a>
                ))}
              </div>
            )}

            <div className="mt-auto p-4 border-top" style={{ borderColor: 'var(--border)' }}>
              {user ? (
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-accent d-flex justify-content-center align-items-center" style={{ width: 32, height: 32, color: '#fff', fontWeight: 'bold' }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-truncate" style={{ flex: 1, fontSize: '14px' }}>{user.username}</div>
                  <button className="control-btn" onClick={logout} title="Log Out"><i className="bi bi-box-arrow-right"></i></button>
                </div>
              ) : (
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-light btn-sm rounded-pill" onClick={() => setAuthModal('register')}>Sign Up</button>
                  <button className="btn btn-accent btn-sm rounded-pill" onClick={() => setAuthModal('login')}>Log In</button>
                </div>
              )}
            </div>
          </div>
        </>
      );
    };

    const PlayerBar = () => {
      const { currentSong, isPlaying, setIsPlaying, queue, queueIndex, setQueueIndex, likeSong, likedSongs } = useContext(AppContext);
      const audioRef = useRef(new Audio());
      const [progress, setProgress] = useState(0);
      const [duration, setDuration] = useState(0);
      const [volume, setVolume] = useState(0.8);
      const [shuffle, setShuffle] = useState(false);
      const [repeat, setRepeat] = useState('none'); // none, all, one

      // Use a ref to access latest state inside the ended event listener without stale closures
      const stateRef = useRef({ queue, queueIndex, repeat, shuffle, isPlaying });
      useEffect(() => {
        stateRef.current = { queue, queueIndex, repeat, shuffle, isPlaying };
      }, [queue, queueIndex, repeat, shuffle, isPlaying]);

      useEffect(() => {
        audioRef.current.loop = repeat === 'one';
      }, [repeat]);

      const handleNext = useCallback(() => {
        const { queue, queueIndex, repeat, shuffle } = stateRef.current;
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
              audio.preload = 'auto'; // Optimize playback speed
              audio.src = `/api/v1/stream/${currentSong.id}`;
              audio.load();
              lastSongIdRef.current = currentSong.id;
              
              if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                  title: currentSong.title,
                  artist: currentSong.artist_name || currentSong.artist || 'Unknown Artist',
                  album: currentSong.album_title || currentSong.album || 'Unknown Album',
                  artwork: [
                    { src: currentSong.cover || currentSong.cover_url || '/static/assets/default-cover.webp', sizes: '512x512', type: 'image/webp' }
                  ]
                });
              }

              // Log play via authenticated fetch (audio element can't send auth headers)
              const token = localStorage.getItem('access_token');
              if (token) {
                fetch(`/api/v1/stream/${currentSong.id}/play`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
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

      useEffect(() => {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
          navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
          navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
          navigator.mediaSession.setActionHandler('nexttrack', handleNext);
        }
      }, [handlePrev, handleNext, setIsPlaying]);

      const handleVolume = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        audioRef.current.volume = val;
      };

      return (
        <div className="player-bar">
          <div className="player-left d-flex align-items-center gap-3">
            {currentSong ? (
              <>
                <img src={currentSong.cover || currentSong.cover_url} alt="cover" className={`player-cover ${isPlaying ? 'cover-spin' : ''}`} />
                <div style={{ minWidth: 0 }}>
                  <div className="card-title text-truncate d-flex align-items-center" style={{ fontSize: 14 }}>
                    {currentSong.title}
                    {isPlaying && (
                      <div className="mini-eq d-none d-md-flex">
                        <span></span><span></span><span></span>
                      </div>
                    )}
                  </div>
                  <div className="card-subtitle text-truncate" style={{ fontSize: 12 }}>{currentSong.artist || currentSong.artist_name}</div>
                </div>
                <button className="control-btn ms-2" onClick={() => likeSong(currentSong.id)}>
                  <i className={`bi ${likedSongs.has(currentSong.id) ? 'bi-heart-fill text-green' : 'bi-heart'}`}></i>
                </button>
              </>
            ) : (
              <div className="text-muted" style={{ fontSize: 12 }}>No track playing</div>
            )}
          </div>
          
          <div className="player-center d-flex flex-column align-items-center gap-2">
            <div className="d-flex align-items-center gap-4">
              <button className={`control-btn ${shuffle ? 'active' : ''}`} onClick={() => setShuffle(!shuffle)}><i className="bi bi-shuffle"></i></button>
              <button className="control-btn fs-4" onClick={handlePrev}><i className="bi bi-skip-start-fill"></i></button>
              <button className="play-btn" onClick={handlePlayPause}>
                <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
              </button>
              <button className="control-btn fs-4" onClick={handleNext}><i className="bi bi-skip-end-fill"></i></button>
              <button className={`control-btn ${repeat !== 'none' ? 'active' : ''}`} onClick={() => {
                if(repeat === 'none') setRepeat('all');
                else if(repeat === 'all') setRepeat('one');
                else setRepeat('none');
              }}>
                <i className={`bi ${repeat === 'one' ? 'bi-repeat-1' : 'bi-repeat'}`}></i>
              </button>
            </div>
            <div className="progress-container w-100 px-3" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>{formatTime(progress)}</span>
              <input
                type="range"
                className="progress-slider"
                min="0"
                max={duration || 100}
                value={progress || 0}
                onChange={(e) => {
                  const newTime = parseFloat(e.target.value);
                  if(audioRef.current) audioRef.current.currentTime = newTime;
                  setProgress(newTime);
                }}
                style={{
                  background: `linear-gradient(to right, #00ffff ${duration ? (progress/duration)*100 : 0}%, rgba(255, 255, 255, 0.15) ${duration ? (progress/duration)*100 : 0}%)`
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '32px' }}>{formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="player-right d-flex justify-content-end align-items-center gap-2 pe-3">
            <i className={`bi ${volume === 0 ? 'bi-volume-mute' : volume < 0.5 ? 'bi-volume-down' : 'bi-volume-up'} text-muted`}></i>
            <input type="range" className="vol-slider" min="0" max="1" step="0.01" value={volume} onChange={handleVolume} />
          </div>
        </div>
      );
    };

    const MusicCard = ({ item, data, type, delay = 0 }) => {
      const { setView, playSong, dynamicTrending } = useContext(AppContext);
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
          setView({ name: 'detail', type, id: actualData.id, data: actualData });
        }
      };

      const handleHover = (e) => {
        $(e.currentTarget).addClass('hovered');
      };
      
      const handleLeave = (e) => {
        $(e.currentTarget).removeClass('hovered');
      };

      return (
        <div 
          className={`music-card animate__animated animate__fadeInUp ${type === 'artist' ? 'artist-card' : ''}`} 
          style={{ animationDelay: `${delay}s` }}
          onClick={handleClick}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          <img src={actualData.cover_url || actualData.cover || actualData.image} alt={actualData.title || actualData.stage_name || actualData.name} />
          <div>
            <div className="card-title">{actualData.title || actualData.stage_name || actualData.name}</div>
            <div className="card-subtitle">{actualData.artist_name || actualData.artist || (type === 'artist' ? 'Artist' : 'Album')}</div>
          </div>
        </div>
      );
    };

    const SongRow = ({ song, index, songsArray, onDeleteSong, onRemoveFromPlaylist }) => {
      const { currentSong, isPlaying, playSong, likeSong, likedSongs, setAddToPlaylistModal } = useContext(AppContext);
      const isCurrent = currentSong?.id === song.id;

      return (
        <div className={`song-row ${isCurrent ? 'active' : ''}`} onDoubleClick={() => playSong(song, songsArray)}>
          <div className="position-relative d-flex justify-content-center align-items-center" style={{ width: 40 }}>
            {isCurrent && isPlaying ? (
              <div className="d-flex align-items-end h-50 eq-bars-container">
                <div className="eq-bar"></div><div className="eq-bar"></div><div className="eq-bar"></div>
              </div>
            ) : (
              <span className="row-num">{index + 1}</span>
            )}
            <i className="bi bi-play-fill row-play-btn" onClick={(e) => { e.stopPropagation(); playSong(song, songsArray); }}></i>
          </div>
          <div><img src={song.cover || song.cover_url} alt="cover" /></div>
          <div className="text-truncate">
            <div style={{ color: isCurrent ? 'var(--green)' : 'var(--text-primary)' }}>{song.title}</div>
            <div style={{ fontSize: 14 }}>{song.artist_name || song.artist}</div>
          </div>
          <div className="row-album text-truncate">{song.album_title || song.album}</div>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="row-actions">
              <i className={`bi ${likedSongs.has(song.id) ? 'bi-heart-fill text-green' : 'bi-heart'}`} onClick={(e) => { e.stopPropagation(); likeSong(song.id); }}></i>
              <i className="bi bi-plus-circle" title="Add to playlist" onClick={(e) => { e.stopPropagation(); setAddToPlaylistModal(song); }}></i>
              {onRemoveFromPlaylist && (
                <i className="bi bi-dash-circle text-warning ms-2" title="Remove from playlist" onClick={(e) => { e.stopPropagation(); onRemoveFromPlaylist(song.id); }}></i>
              )}
              {onDeleteSong && (
                <i className="bi bi-trash text-danger ms-2" title="Delete song" onClick={(e) => { e.stopPropagation(); onDeleteSong(song.id); }}></i>
              )}
            </div>
            <span>{formatTime(song.duration_secs || song.duration)}</span>
          </div>
        </div>
      );
    };

    const HomeView = () => {
      const { dynamicArtists, dynamicAlbums, dynamicTrending, setView, dynamicAllSongs } = useContext(AppContext);
      
      const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
      };

      return (
        <div className="animate__animated animate__fadeIn">
          <h1 className="hero-text mb-5">{getGreeting()}</h1>
          
          <div className="d-flex justify-content-between align-items-end mb-3">
            <h2>Trending Now</h2>
            <a href="#" onClick={(e) => { 
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
            }} className="text-accent text-decoration-none">See all</a>
          </div>
          <div className="horizontal-scroll mb-5">
            {dynamicTrending.map((song, idx) => (
              <MusicCard key={song.id} item={song} type="song" delay={idx * 0.05} />
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-end mb-3">
            <h2>Featured Albums</h2>
            <a href="#" onClick={(e) => { e.preventDefault(); setView({ name: 'category', type: 'albums' }); }} className="text-accent text-decoration-none">See all</a>
          </div>
          <div className="horizontal-scroll mb-5">
            {dynamicAlbums.map((album, idx) => (
              <MusicCard key={album.id} item={album} type="album" delay={idx * 0.05} />
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-end mb-3">
            <h2>Browse Artists</h2>
            <a href="#" onClick={(e) => { e.preventDefault(); setView({ name: 'category', type: 'artists' }); }} className="text-accent text-decoration-none">See all</a>
          </div>
          <div className="horizontal-scroll mb-5">
            {dynamicArtists.map((artist, idx) => (
              <MusicCard key={artist.id} item={artist} type="artist" delay={idx * 0.05} />
            ))}
          </div>
        </div>
      );
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
            success: (data) => {
              setResults({ songs: data.songs || [], albums: data.albums || [], artists: data.artists || [] });
            },
            error: () => console.error("Search failed")
          });
        }, 300);
        return () => clearTimeout(delayDebounceFn);
      }, [query]);

      return (
        <div className="animate__animated animate__fadeIn">
          <div className="input-group mb-5 shadow-lg" style={{ maxWidth: 600 }}>
            <span className="input-group-text bg-card border-0 text-muted"><i className="bi bi-search"></i></span>
            <input 
              type="text" 
              className="form-control border-0 py-3 bg-card text-primary" 
              placeholder="What do you want to listen to?" 
              style={{ fontSize: 18 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {!results ? (
            <>
              <h3 className="mb-4">Browse All</h3>
              <div className="row g-4">
                {MOCK_GENRES.map((g, idx) => (
                  <div key={g.id} className="col-6 col-md-4 col-lg-3 animate__animated animate__zoomIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="genre-tile" style={{ background: g.bg, cursor: 'pointer' }} onClick={() => setQuery(g.name)}>
                      {g.name}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="row g-5">
              <div className="col-12 col-xl-6">
                <h3 className="mb-3">Songs</h3>
                {results.songs.length ? results.songs.slice(0,5).map((s, i) => (
                  <SongRow key={s.id} song={s} index={i} songsArray={results.songs} />
                )) : <p className="text-muted">No songs found.</p>}
              </div>
              <div className="col-12 col-xl-6">
                <h3 className="mb-3">Albums & Artists</h3>
                <div className="horizontal-scroll">
                  {results.albums.map(a => <MusicCard key={a.id} item={a} type="album" />)}
                  {results.artists.map(a => <MusicCard key={a.id} item={a} type="artist" />)}
                </div>
                {!results.albums.length && !results.artists.length && <p className="text-muted">No albums or artists found.</p>}
              </div>
            </div>
          )}
        </div>
      );
    };

    const LibraryView = () => {
      const [tab, setTab] = useState('playlists');
      const [uploadMode, setUploadMode] = useState('youtube');
      const { likedSongs, user, setAuthModal, showToast, userPlaylists, setPlaylistModal, dynamicAllSongs, fetchAllSongs, mySongs, setMySongs, fetchMySongs } = useContext(AppContext);

      return (
        <div className="animate__animated animate__fadeIn h-100 d-flex flex-column">
          <h1 className="mb-4">Your Library</h1>
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button type="button" className={`nav-link ${tab === 'playlists' ? 'active' : ''}`} onClick={() => setTab('playlists')}>Playlists</button>
            </li>
            <li className="nav-item">
              <button type="button" className={`nav-link ${tab === 'liked' ? 'active' : ''}`} onClick={() => setTab('liked')}>Liked Songs</button>
            </li>
            <li className="nav-item">
              <button type="button" className={`nav-link ${tab === 'mysongs' ? 'active' : ''}`} onClick={() => setTab('mysongs')}>My Songs</button>
            </li>
            <li className="nav-item">
              <button type="button" className={`nav-link ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>Upload</button>
            </li>
          </ul>

          <div className="flex-grow-1 position-relative">
            {tab === 'playlists' && (
              <div className="row g-4 animate__animated animate__fadeIn">
                <div className="col-6 col-md-4 col-lg-3 col-xl-2">
                  <div className="music-card d-flex flex-column justify-content-center align-items-center h-100" style={{ minHeight: '220px', border: '2px dashed var(--border)', background: 'transparent' }} onClick={() => { user ? setPlaylistModal(true) : setAuthModal('login') }}>
                    <i className="bi bi-plus-circle text-accent" style={{ fontSize: '48px' }}></i>
                    <h5 className="mt-3 text-primary">Create Playlist</h5>
                  </div>
                </div>
                {userPlaylists && userPlaylists.map(p => (
                  <div key={p.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                    <MusicCard item={p} type="playlist" />
                  </div>
                ))}
                {!user && <p className="text-muted w-100 mt-4">Sign in to see your playlists.</p>}
              </div>
            )}
            
            {tab === 'liked' && (
              <div className="animate__fadeIn">
                <div className="song-row text-uppercase label" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>#</div><div>Title</div><div className="row-album">Album</div><div className="text-end"><i className="bi bi-clock"></i></div>
                </div>
                {dynamicAllSongs && dynamicAllSongs.filter(s => likedSongs.has(s.id)).map((s, i, arr) => (
                  <SongRow key={s.id} song={s} index={i} songsArray={arr} />
                ))}
                {likedSongs.size === 0 && <p className="text-muted mt-4 text-center">Songs you like will appear here.</p>}
              </div>
            )}

            {tab === 'mysongs' && (
              <div className="animate__fadeIn">
                <div className="song-row text-uppercase label" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>#</div><div>Title</div><div className="row-album">Album</div><div className="text-end"><i className="bi bi-clock"></i></div>
                </div>
                {mySongs && mySongs.map((s, i, arr) => (
                  <SongRow 
                    key={s.id} 
                    song={s} 
                    index={i} 
                    songsArray={arr} 
                    onDeleteSong={(songId) => {
                      if (!confirm("Are you sure you want to permanently delete this song?")) return;
                      $.ajax({
                        url: `/api/v1/songs/${songId}`,
                        type: 'DELETE',
                        success: () => {
                          showToast('Song deleted');
                          fetchMySongs();
                          fetchAllSongs();
                        },
                        error: (xhr) => showToast(xhr.responseJSON?.error || 'Failed to delete song')
                      });
                    }}
                  />
                ))}
                {(!mySongs || mySongs.length === 0) && (
                  <p className="text-muted mt-4 text-center">You haven't uploaded any songs yet.</p>
                )}
              </div>
            )}

            {tab === 'upload' && (
              <div className="animate__fadeIn mt-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="p-4" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0">Add a Track</h3>
                    {user && (
                      <div className="btn-group" role="group">
                        <button type="button" className={`btn btn-sm ${uploadMode === 'youtube' ? 'btn-accent text-dark fw-bold' : 'btn-outline-light'}`} onClick={() => setUploadMode('youtube')}>YouTube</button>
                        <button type="button" className={`btn btn-sm ${uploadMode === 'file' ? 'btn-accent text-dark fw-bold' : 'btn-outline-light'}`} onClick={() => setUploadMode('file')}>Local File</button>
                      </div>
                    )}
                  </div>
                  {!user ? (
                    <div className="text-center py-4">
                      <p className="text-muted mb-4">You must be logged in to add tracks.</p>
                      <button className="btn btn-primary px-4 rounded-pill" onClick={() => setAuthModal('login')}>Log In</button>
                    </div>
                  ) : uploadMode === 'youtube' ? (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const submitBtn = e.target.querySelector('button[type="submit"]');
                        submitBtn.disabled = true;
                        const originalBtnHtml = submitBtn.innerHTML;

                        const setBtnState = (text) => {
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

                          const newSong = await $.ajax({
                            url: '/api/v1/songs/upload',
                            type: 'POST',
                            data: uploadData,
                            processData: false,
                            contentType: false
                          });

                          setMySongs(prev => [newSong, ...prev]);
                          showToast('Song imported successfully!');
                          e.target.reset();
                          setTab('mysongs');
                          fetchAllSongs();

                        } catch (err) {
                          const msg = err.responseJSON?.error || err.message || 'Unknown error';
                          showToast('Import failed: ' + msg);
                        } finally {
                          submitBtn.disabled = false;
                          submitBtn.innerHTML = originalBtnHtml;
                        }
                      }}>
                      <div className="mb-4">
                        <label className="form-label text-muted small text-uppercase">YouTube URL</label>
                        <input type="url" name="youtube_url" className="form-control" placeholder="https://www.youtube.com/watch?v=..." style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} required />
                      </div>
                      <div className="mb-5">
                        <label className="form-label text-muted small text-uppercase">Track Title (Optional)</label>
                        <input type="text" name="title" className="form-control" placeholder="Leave blank to use YouTube title" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                      </div>
                      <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold">Import from YouTube</button>
                    </form>
                  ) : (
                    <form onSubmit={(e) => {
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
                        success: (newSong) => {
                          setMySongs(prev => [newSong, ...prev]);
                          showToast('Song uploaded successfully!');
                          e.target.reset();
                          submitBtn.disabled = false;
                          submitBtn.innerHTML = 'Upload Track';
                          setTab('mysongs');
                          fetchAllSongs();
                        },
                        error: (xhr) => {
                          showToast('Upload failed: ' + (xhr.responseJSON?.error || 'Unknown error'));
                          submitBtn.disabled = false;
                          submitBtn.innerHTML = 'Upload Track';
                        }
                      });
                    }}>
                      <div className="mb-4">
                        <label className="form-label text-muted small text-uppercase">Track Title</label>
                        <input type="text" name="title" className="form-control" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} required />
                      </div>
                      <div className="mb-4">
                        <label className="form-label text-muted small text-uppercase">Audio File (MP3/FLAC)</label>
                        <input type="file" name="audio_file" accept="audio/*" className="form-control" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} required />
                      </div>
                      <div className="mb-5">
                        <label className="form-label text-muted small text-uppercase">Cover Art (Optional Image)</label>
                        <input type="file" name="cover_file" accept="image/*" className="form-control" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                      </div>
                      <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold">Upload Track</button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    const CategoryView = () => {
      const { currentView, dynamicAlbums, dynamicArtists, dynamicAllSongs } = useContext(AppContext);
      const { type } = currentView;
      
      let title, items, cardType;
      if (type === 'albums') {
        title = 'Featured Albums'; items = dynamicAlbums; cardType = 'album';
      } else if (type === 'songs') {
        title = 'New Releases'; items = dynamicAllSongs; cardType = 'song';
      } else {
        title = 'Browse Artists'; items = dynamicArtists; cardType = 'artist';
      }

      return (
        <div className="animate__animated animate__fadeIn">
          <h1 className="hero-text mb-5">{title}</h1>
          <div className="row g-4">
            {items.map((item, idx) => (
              <div key={item.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                <MusicCard item={item} type={cardType} delay={idx * 0.05} />
              </div>
            ))}
          </div>
        </div>
      );
    };

    const DetailView = () => {
      const { detailContext, playSong, user, showToast, fetchUserPlaylists, setView } = useContext(AppContext);
      const { type, data } = detailContext;
      const [songs, setSongs] = useState([]);
      
      useEffect(() => {
        if (type === 'album') {
          $.ajax({
            url: `/api/v1/albums/${data.id}`,
            type: 'GET',
            success: (res) => {
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
        if(songs.length) playSong(songs[0], songs);
      };

      const handleDeletePlaylist = () => {
        if (!confirm("Are you sure you want to delete this playlist?")) return;
        $.ajax({
          url: `/api/v1/playlists/${data.id}`,
          type: 'DELETE',
          success: () => {
            showToast('Playlist deleted');
            fetchUserPlaylists();
            setView({ name: 'library' });
          },
          error: (xhr) => showToast(xhr.responseJSON?.error || 'Failed to delete playlist')
        });
      };

      const handleRemoveFromPlaylist = (songId) => {
        const previousSongs = [...songs];
        setSongs(songs.filter(s => s.id !== songId)); // Optimistic UI update
        $.ajax({
          url: `/api/v1/playlists/${data.id}/songs/${songId}`,
          type: 'DELETE',
          success: (res) => {
            showToast('Song removed');
            detailContext.data.songs = res.songs;
          },
          error: (xhr) => {
            showToast(xhr.responseJSON?.error || 'Failed to remove song');
            setSongs(previousSongs);
          }
        });
      };

      return (
        <div className="animate__animated animate__fadeIn">
          <div className="hero-section">
            <div className="hero-bg" style={{ backgroundImage: `url(${data.cover_url || data.cover || data.image})` }}></div>
            <div className="hero-content">
              <img src={data.cover_url || data.cover || data.image} className="hero-cover" alt="cover" />
              <div>
                <div className="label mb-2">{type}</div>
                <h1 className={`hero-text mb-3 ${type === 'artist' ? 'detail-hero-text' : ''}`}>{data.title || data.name}</h1>
                <div className="d-flex align-items-center gap-3 text-muted">
                  {type === 'album' && <span><span className="text-primary fw-bold">{data.artist_name || data.artist}</span> • {songs.length} songs</span>}
                  {type === 'playlist' && <span>Created by <span className="text-primary fw-bold">{data.owner_name}</span> • {songs.length} songs</span>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4 d-flex align-items-center gap-3">
            <button className="play-btn d-inline-flex" style={{ width: 56, height: 56, fontSize: 28 }} onClick={handlePlayAll} title="Play All">
              <i className="bi bi-play-fill"></i>
            </button>
            <button className="control-btn fs-2" onClick={() => {
                if(songs.length) {
                  const shuffled = [...songs].sort(() => Math.random() - 0.5);
                  playSong(shuffled[0], shuffled);
                }
              }} title="Shuffle Play">
                <i className="bi bi-shuffle"></i>
              </button>
            {type === 'playlist' && user && data.owner_id === user.id && (
              <button className="btn btn-outline-danger px-4 rounded-pill fw-bold" onClick={handleDeletePlaylist}>
                Delete Playlist
              </button>
            )}
          </div>

          <div className="song-row text-uppercase label" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>#</div><div>Title</div><div className="row-album">Album</div><div className="text-end"><i className="bi bi-clock"></i></div>
          </div>
          
          {songs.map((song, i) => (
            <SongRow 
              key={song.id} 
              song={song} 
              index={i} 
              songsArray={songs} 
              onRemoveFromPlaylist={type === 'playlist' && user && data.owner_id === user.id ? handleRemoveFromPlaylist : null}
            />
          ))}
          {songs.length === 0 && <p className="text-muted mt-4 text-center">No songs found.</p>}
        </div>
      );
    };

    const AuthModal = () => {
      const { authModal, setAuthModal, setUser, showToast } = useContext(AppContext);
      const isLogin = authModal === 'login';

      const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        $.ajax({
          url: isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: (res) => {
            if (res.access_token) {
              localStorage.setItem('access_token', res.access_token);
              $.ajaxSetup({ headers: { 'Authorization': `Bearer ${res.access_token}` } });
            }
            if (res.user) setUser(res.user);
            setAuthModal(null);
          },
          error: (xhr) => {
                          showToast('Authentication failed');
          }
        });
      };

      if (!authModal) return null;

      return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content animate__animated animate__zoomIn animate__faster" style={{ background: 'var(--bg-glass)', backdropFilter: 'var(--blur-heavy)', border: '1px solid rgba(0,255,255,0.1)', color: '#fff', borderRadius: '16px' }}>
              <div className="modal-header d-flex flex-column align-items-center position-relative border-0 pb-0">
                <h5 className="modal-title">{isLogin ? 'Log In' : 'Sign Up'}</h5>
                <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={() => setAuthModal(null)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="mb-3">
                      <label className="form-label label">Username</label>
                      <input type="text" name="username" className="form-control" required />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label label">Email</label>
                    <input type="email" name="email" className="form-control" required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label label">Password</label>
                    <input type="password" name="password" className="form-control" required />
                  </div>
                  <button type="submit" className="btn btn-accent w-100 py-2 mb-3">
                    {isLogin ? 'Log In' : 'Sign Up'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const CreatePlaylistModal = () => {
      const { playlistModal, setPlaylistModal, showToast, fetchUserPlaylists } = useContext(AppContext);
      if (!playlistModal) return null;
      return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content original-theme animate__animated animate__zoomIn animate__faster">
              <div className="modal-header d-flex flex-column align-items-center position-relative">
                <h5 className="modal-title">Create Playlist</h5>
                <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={() => setPlaylistModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={(e) => {
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
                }}>
                  <div className="mb-4">
                    <label className="form-label label">Playlist Name</label>
                    <input type="text" name="title" className="form-control" required />
                  </div>
                  <button type="submit" className="btn btn-accent w-100 py-2">Create</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const AddToPlaylistModal = () => {
      const { addToPlaylistModal, setAddToPlaylistModal, showToast, userPlaylists } = useContext(AppContext);
      if (!addToPlaylistModal) return null;
      const song = addToPlaylistModal;

      return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content original-theme animate__animated animate__zoomIn animate__faster">
              <div className="modal-header d-flex flex-column align-items-center position-relative">
                <h5 className="modal-title">Add to Playlist</h5>
                <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={() => setAddToPlaylistModal(null)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="text-muted mb-4">Select a playlist for <strong>{song.title}</strong>:</p>
                {(!userPlaylists || userPlaylists.length === 0) ? (
                  <p className="text-muted">You don't have any playlists yet.</p>
                ) : (
                  <div className="d-grid gap-2">
                    {userPlaylists.map(p => (
                      <button key={p.id} className="btn btn-outline-light w-100 text-start py-3 mb-2 rounded-3" onClick={() => {
                        setAddToPlaylistModal(null);
                        showToast(`Adding to ${p.title}...`);
                        $.ajax({
                          url: `/api/v1/playlists/${p.id}/songs`,
                          type: 'POST',
                          contentType: 'application/json',
                          data: JSON.stringify({ song_id: song.id }),
                          success: () => {
                            showToast(`Added to ${p.title}`);
                          },
                          error: (xhr) => showToast(xhr.responseJSON?.error || 'Failed to add song')
                        });
                      }}>
                        <i className="bi bi-music-note-list me-3"></i> {p.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };

    const App = () => {
      const [currentView, setView] = useState({ name: 'home' });
      const [detailContext, setDetailContext] = useState(null);
      const [queue, setQueue] = useState([]);
      const [queueIndex, setQueueIndex] = useState(0);
      const [isPlaying, setIsPlaying] = useState(false);
      const currentSong = queue[queueIndex] || null;
      const [user, setUser] = useState(null);
      const [authModal, setAuthModal] = useState(localStorage.getItem('access_token') ? null : 'login');
      const [likedSongs, setLikedSongs] = useState(new Set());
      const [toast, setToast] = useState({ show: false, msg: '' });

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
          $.ajax({ url: '/api/v1/playlists/', type: 'GET', success: setUserPlaylists });
        } else {
          setUserPlaylists([]);
        }
      }, [user]);

      const fetchMySongs = useCallback(() => {
        if (user) {
          $.ajax({ 
            url: '/api/v1/songs/mine', 
            type: 'GET', 
            success: (res) => {
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
          success: (res) => {
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
        $.ajax({ url: '/api/v1/artists/', type: 'GET', success: setDynamicArtists });
        $.ajax({ url: '/api/v1/albums/', type: 'GET', success: setDynamicAlbums });
        $.ajax({ 
          url: '/api/v1/songs/trending', 
          type: 'GET', 
          success: (res) => {
            setDynamicTrending(res.map(s => ({
              ...s,
              audio: s.audio || s.file_path,
              cover: s.cover || s.cover_url
            })));
          } 
        });
        fetchAllSongs();
      }, [fetchAllSongs]);

      const showToast = (msg) => {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), 3000);
      };

      const handleSetView = (viewObj) => {
        if (viewObj.name === 'detail') setDetailContext(viewObj);
        setView(viewObj);
        window.history.pushState(viewObj, '', '?view=' + viewObj.name);
      };

      const playSong = (song, newQueue) => {
        setQueue(newQueue);
        setQueueIndex(newQueue.findIndex(s => s.id === song.id));
        setIsPlaying(true);
      };

      const likeSong = (id) => {
        setLikedSongs(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      };

      const logout = () => {
        localStorage.removeItem('access_token');
        $.ajaxSetup({ headers: { 'Authorization': '' } });
        setUser(null);
        showToast('Logged out');
      };

      // Handle popstate for browser back button
      useEffect(() => {
        const handlePopState = (e) => {
          if (e.state && e.state.name) {
            if (e.state.name === 'detail') setDetailContext(e.state);
            setView(e.state);
          } else {
            setView({ name: 'home' });
          }
        };
        window.addEventListener('popstate', handlePopState);
        // initialize first state
        window.history.replaceState({ name: 'home' }, '', '?view=home');
        return () => window.removeEventListener('popstate', handlePopState);
      }, []);

      // Check session on mount
      useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
          $.ajaxSetup({ headers: { 'Authorization': `Bearer ${token}` } });
          $.ajax({
            url: '/api/v1/auth/me',
            type: 'GET',
            success: (res) => {
              if (res.user) setUser(res.user);
            },
            error: () => {
              localStorage.removeItem('access_token');
              $.ajaxSetup({ headers: { 'Authorization': '' } });
            }
          });
        }
      }, []);

      const contextValue = {
        currentView, setView: handleSetView,
        detailContext, playSong, currentSong,
        isPlaying, setIsPlaying, queue, queueIndex, setQueueIndex,
        user, setUser, authModal, setAuthModal,
        likedSongs, likeSong, showToast, logout,
        dynamicArtists, dynamicAlbums, dynamicTrending, dynamicAllSongs, fetchAllSongs,
        mySongs, setMySongs, fetchMySongs,
        userPlaylists, setUserPlaylists, fetchUserPlaylists,
        playlistModal, setPlaylistModal,
        addToPlaylistModal, setAddToPlaylistModal,
        mobileMenuOpen, setMobileMenuOpen
      };

      return (
        <AppContext.Provider value={contextValue}>
          <div id="app-grid">
            <div className="glow-layer glow1" style={{ top: '30%', left: '20%' }}></div>
            <div className="glow-layer glow2" style={{ top: '60%', left: '80%' }}></div>
            <Sidebar />
            <div className="main-area" id="main-scroll">
              <div className="mobile-header d-md-none d-flex justify-content-between align-items-center w-100">
                <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => setView({ name: 'home' })}>
                  <img src="/static/assets/audicore-logo.webp" alt="Audicore Logo" style={{ height: 30, objectFit: 'contain' }} />
                  <div className="logo-text fw-bold fs-4" style={{ fontFamily: 'Clash Display', margin: 0 }}>Audicore</div>
                </div>
                <i className="bi bi-list fs-1 text-white" style={{ cursor: 'pointer' }} onClick={() => setMobileMenuOpen(true)}></i>
              </div>
              {currentView.name === 'home' && <HomeView />}
              {currentView.name === 'search' && <SearchView />}
              {currentView.name === 'library' && <LibraryView />}
              {currentView.name === 'category' && <CategoryView />}
              {currentView.name === 'detail' && <DetailView />}
            </div>
            <PlayerBar />
          </div>
          <AuthModal />
          <CreatePlaylistModal />
          <AddToPlaylistModal />
          <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
        </AppContext.Provider>
      );
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);

    // Initialize tooltips (jQuery & Bootstrap)
    $(function () {
      $('[data-bs-toggle="tooltip"]').tooltip();
    });
