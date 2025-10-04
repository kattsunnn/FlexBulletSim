import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
//サブコンポーネント
import InfoItem from './InfoItem.jsx';
import ProgressBar from './ProgressBar.jsx';
// アイコン
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';


// 🎨 共通スタイルオブジェクト
const accordionStyle = {
  width: 300,
  borderRadius: 3,
  boxShadow: 3,
  overflow: 'hidden',

};

const summaryStyle = {
  bgcolor: 'primary.main',
  color: 'white',
  '& .MuiTypography-root': { fontWeight: 'bold' },
};

export default function ControlPanel({ state, handle }) {
  const { currentCamera, currentFocus, currentPosition, progress, positionList } = state;
  const { handleImportPosition, handleDeletePosition, handleSelectPosition, handleToggleFOVMode } = handle;
  // 🔑 ダイアログの開閉状態を管理
  const [open, setOpen] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [newPosition, setNewPosition] = React.useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFile = async (file) => {
    if (file && file.type === "application/json") {
      const text = await file.text();
      try {
        const json = JSON.parse(text);// JSONパース
        setNewPosition(JSON.stringify(json, null, 2)); // 整形して表示
      } catch (err) {
        alert("JSONの読み込みに失敗しました");
      }
    } else {
      alert("JSONファイルを選択してください");
    }
  };



  const handleSave = () => {
    try {
      if (!newPosition) return;
      const data = JSON.parse(newPosition)
      handleImportPosition?.(data);
      setOpen(false);
      setNewPosition('');
    } catch (e) {
      alert('JSONが不正です');
      console.error(e);
    }
  };

  const handleSelect = (id) => () => {
    handleSelectPosition?.(id);
  };

  const handleToggleFOV = (id) => {
    handleToggleFOVMode?.(id);
  }

  const handleDelete = (id) => {
    if (window.confirm('本当に削除しますか？')) {
      handleDeletePosition?.(id);
    }
  };



  return (
    <>
    <Accordion defaultExpanded sx={accordionStyle}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={summaryStyle}>
        <Typography variant="subtitle1">操作方法</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: 'grey.50', p: 2 }}>
        <Typography variant="body2" paragraph>
          🎥 <b>ポジション追加：</b>  
          JSONファイルをドラッグ＆ドロップ、またはクリックで選択して読み込みます。
        </Typography>
        <Typography variant="body2" paragraph>
          🗑️ <b>削除：</b>  
          各ポジション右端の <DeleteIcon fontSize="small" /> ボタンをクリックすると削除できます。
        </Typography>
        <Typography variant="body2" paragraph>
          ⚙️ <b>設定：</b>  
          <SettingsIcon fontSize="small" /> ボタンからポジションの設定を変更できます（※開発予定）。
        </Typography>
        <Typography variant="body2">
          🖱️ <b>選択：</b>  
          リスト内の項目をクリックすると、そのポジションがアクティブになります。
        </Typography>
      </AccordionDetails>
    </Accordion>

    <Accordion defaultExpanded sx={accordionStyle}>
      {/* タイトル部分 */}
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={summaryStyle}>
        <Typography variant="subtitle1">操作パネル</Typography>
      </AccordionSummary>

      {/* 詳細部分 */}
      <AccordionDetails sx={{ p: 2 }}>
        <InfoItem label="カメラ" value={currentCamera} />
        <Divider sx={{ my: 1 }} />
        <InfoItem label="フォーカス" value={currentFocus} />
        <Divider sx={{ my: 1 }} />
        <InfoItem label="パターン" value={currentPosition} />
        <Divider sx={{ my: 1 }} />
        <ProgressBar label="進捗" value={progress} />
        <Divider sx={{ my: 1 }} />

        <Button 
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            sx={{ mb: 1 }}
            onClick={handleOpen}
        >
            ポジション追加
          </Button>

        {/* ポジション一覧 */}
        <Box>
          <Typography variant="body2" color="text.secondary">ポジション一覧</Typography>

          {positionList && positionList.length > 0 ? (
            <List dense>
              {positionList.map((pos) => (
                <ListItem 
                    key={pos.id}
                    divider
                    onClick={handleSelect(pos.id)}
                    secondaryAction={
                        <>
                        {/* 設定ボタン */}
                        <Button
                            variant="contained"
                            size="small"  
                            edge="end"
                            aria-label="settings"
                            sx={{ 
                              ml: 0.2
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFOV(pos.id);
                            }}
                        >
                            {pos.autoScaleFOV ? "Auto" : "Fixed"}
                        </Button>

                        {/* 削除ボタン */}
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            sx={{ ml: 0.2}}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(pos.id);
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                        </>
                    }
                >
                  <ListItemButton onClick={handleSelect(pos.id)}>
                  <ListItemText primary={pos.positionName} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.disabled">
              なし
            </Typography>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>

    {/* 📌 ダイアログ */}
    <Dialog open={open} onClose={handleClose} >
    <DialogTitle>ポジション追加</DialogTitle>
    <DialogContent>
      {/* ドラッグ&ドロップ / クリック領域 */}
      <Box
        onDrop={(e) => { 
          e.preventDefault();
          setIsDragOver(false);
          handleFile(e.dataTransfer.files[0])
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          setIsDragOver(false);
        }}
        sx={{
          border: "2px dashed gray",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          cursor: "pointer",
          "&:hover": { bgcolor: "grey.300" },
          width: "50vw"
        }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <Typography variant="body1" color="textSecondary">
          ドラッグ&ドロップ<br /> 
          または<br />
          クリックして選択
        </Typography>
      </Box>

      {/* 非表示のファイル入力 */}
      <input
        id="fileInput"
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* 読み込んだ内容を表示 */}
      {newPosition && (
        <Box mt={2} p={2} sx={{ bgcolor: "grey.100", borderRadius: 1 }}>
          <Typography variant="caption">読み込んだJSON:</Typography>
          <pre style={{ maxHeight: 200, overflow: "auto" }}>{newPosition}</pre>
        </Box>
      )}
    </DialogContent>
    <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
        <Button variant="contained" onClick={handleSave}>保存</Button>
    </DialogActions>
    </Dialog>
  </>
);
}
