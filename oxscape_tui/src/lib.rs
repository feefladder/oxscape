
/// Arrows that point in the direction
/// ```
/// # use oxscape_tui::DIRS;
/// let x = 8;
/// let idx = [
/// 1,2,3,
/// 0,x,4,
/// 7,6,5,
/// ];
/// let arr = [
/// '🡼','🡹','🡽',
/// '🡸','❀','🡺',
/// '🡿','🡻','🡾',
/// ];
/// for i in 0..8 {
///   let n = idx[i];
///   if n != x {
///     assert_eq!(DIRS[n], arr[i]);
///   }
/// }
/// ```
pub const DIRS: [char; 9] = ['🡸','🡼','🡹','🡽','🡺','🡾','🡻','🡿','❀'];


