use crate::AppState;
use crate::services::AssetService;
use tauri::State;

#[tauri::command]
pub fn save_image(
  state: State<AppState>,
  image_data: Vec<u8>,
  extension: String,
) -> Result<String, String> {
  let context = state.get_context()?;
  AssetService::save_image(&image_data, &extension, &context.config)
}
