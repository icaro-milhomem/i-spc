# Code Citations

## License: MIT
https://github.com/mui/material-ui/blob/f3cb496c999acbc8f19533e38df20be12e56d059/docs/data/material/components/drawers/ResponsiveDrawer.tsx

```
{{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)',
          boxShadow: '0 2px 8px #0002'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            {menuItems.find(item => location.pathname.startsWith(item.path))?.text || 'i-SPC'}
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <div>
            {/* ...existing code... */}
```