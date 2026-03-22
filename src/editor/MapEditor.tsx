import { useReducer, useEffect, useCallback } from 'react';
import { editorReducer, createInitialEditorState } from './editorState';
import { loadEditorTileConfig } from './tileConfigLoader';
import Toolbox from './components/Toolbox';
import DrawingArea from './components/DrawingArea';
import MapSettingsBar from './components/MapSettingsBar';

export default function MapEditor() {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialEditorState);

  useEffect(() => {
    loadEditorTileConfig().then(({ config, images }) => {
      dispatch({ type: 'SET_TILE_CONFIG', config, images });
    });
  }, []);

  const handleDeleteSelection = useCallback(() => {
    if (!state.selection) {
      return;
    }
    if (!window.confirm('Delete the selected tiles?')) {
      return;
    }
    const defaultFloorTile = state.tileConfig
      ? Object.keys(state.tileConfig.tiles).find((code) => {
          const classLetter = code[0];
          return state.tileConfig!.classes[classLetter] && !state.tileConfig!.classes[classLetter].solid;
        }) ?? Object.keys(state.tileConfig.tiles)[0]
      : null;
    if (defaultFloorTile) {
      dispatch({ type: 'DELETE_SELECTION', replacementTile: defaultFloorTile });
    }
  }, [state.selection, state.tileConfig]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (state.selection) {
          e.preventDefault();
          handleDeleteSelection();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selection, handleDeleteSelection]);

  const handleFillSelection = () => {
    if (!state.selection || !state.selectedTileCode) {
      return;
    }
    dispatch({ type: 'FILL_SELECTION', tileCode: state.selectedTileCode });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d0d1a', color: '#ccc' }}>
      <MapSettingsBar state={state} dispatch={dispatch} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Toolbox
          tileConfig={state.tileConfig}
          selectedTileCode={state.selectedTileCode}
          activeTool={state.activeTool}
          selection={state.selection}
          onSelectTile={(code) => dispatch({ type: 'SELECT_TILE_CODE', code })}
          onSetTool={(tool) => dispatch({ type: 'SET_TOOL', tool })}
          onDeleteSelection={handleDeleteSelection}
          onFillSelection={handleFillSelection}
          onAutoBorder={(wallTileCode) => dispatch({ type: 'AUTO_BORDER', wallTileCode })}
          onAutoRandomBorder={(wallTileCodes) => dispatch({ type: 'AUTO_RANDOM_BORDER', wallTileCodes })}
        />
        <DrawingArea state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
