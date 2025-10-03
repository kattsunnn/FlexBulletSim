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

export default function ControlPanel({ state }) {
  const { currentCamera, currentFocus, currentPosition, progress, positionList } = state;

  // 🔑 ダイアログの開閉状態を管理
  const [open, setOpen] = React.useState(false);
  const [newPosition, setNewPosition] = React.useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
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
          <Typography >ポジション一覧</Typography>

          {positionList && positionList.length > 0 ? (
            <List dense>
              {positionList.map((name, idx) => (
                <ListItem 
                    key={idx}
                    divider
                    secondaryAction={
                        <>
                        {/* 設定ボタン */}
                        <IconButton
                            edge="end"
                            aria-label="settings"
                            sx={{ ml: 0.2 }}
                            onClick={(e) => {
                            e.stopPropagation();
                            console.log(`設定変更: ${name}`);
                            // ここに設定変更処理を追加
                            }}
                        >
                            <SettingsIcon />
                        </IconButton>

                        {/* 削除ボタン */}
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            sx={{ ml: 0.2}}
                            onClick={(e) => {
                            e.stopPropagation();
                            onDelete(idx);
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                        </>
                    }
                >
                  <ListItemText primary={name} />
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
    <Dialog open={open} onClose={handleClose}>
    <DialogTitle>ポジション追加</DialogTitle>
    <DialogContent>
        <TextField
        autoFocus
        margin="dense"
        label="ポジション名"
        fullWidth
        value={newPosition}
        onChange={(e) => setNewPosition(e.target.value)}
        />
    </DialogContent>
    <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
        <Button variant="contained" >保存</Button>
    </DialogActions>
    </Dialog>
  </>
);
}
