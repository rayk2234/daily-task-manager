import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
  Grid,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { format, isToday, isFuture, isPast, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    text: '',
    category: '업무',
    dueDate: new Date(),
    priority: '보통'
  });
  const [currentTab, setCurrentTab] = useState(0);

  const categories = ['업무', '개인', '회의', '기타'];
  const priorities = ['낮음', '보통', '높음'];

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (newTaskData.text.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: newTaskData.text,
          category: newTaskData.category,
          createdDate: new Date(),
          dueDate: newTaskData.dueDate,
          priority: newTaskData.priority,
          completed: false
        }
      ]);
      setNewTaskData({
        text: '',
        category: '업무',
        dueDate: new Date(),
        priority: '보통'
      });
      setOpenDialog(false);
    }
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleToggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getFilteredTasks = () => {
    const startOfSelectedDate = startOfDay(selectedDate);
    return tasks.filter(task => {
      const taskDate = startOfDay(new Date(task.dueDate));
      return taskDate.getTime() === startOfSelectedDate.getTime();
    });
  };

  const getCompletionRate = () => {
    const filteredTasks = getFilteredTasks();
    if (filteredTasks.length === 0) return 0;
    const completedTasks = filteredTasks.filter(task => task.completed);
    return (completedTasks.length / filteredTasks.length) * 100;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case '높음': return '#f44336';
      case '보통': return '#2196f3';
      case '낮음': return '#4caf50';
      default: return '#2196f3';
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const getTasksByStatus = () => {
    const filteredTasks = getFilteredTasks();
    switch (currentTab) {
      case 0: return filteredTasks;
      case 1: return filteredTasks.filter(task => !task.completed);
      case 2: return filteredTasks.filter(task => task.completed);
      default: return filteredTasks;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              일일 업무 기록
            </Typography>
            <IconButton color="inherit" onClick={() => setOpenDialog(true)}>
              <AddIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DatePicker
                      value={selectedDate}
                      onChange={setSelectedDate}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      오늘의 달성률
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getCompletionRate()} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 1 }}>
                      {Math.round(getCompletionRate())}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Tabs value={currentTab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
                  <Tab label="전체" />
                  <Tab label="진행 중" />
                  <Tab label="완료" />
                </Tabs>

                <List>
                  {getTasksByStatus().map((task) => (
                    <ListItem
                      key={task.id}
                      sx={{
                        mb: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <IconButton onClick={() => handleToggleTask(task.id)}>
                        {task.completed ? 
                          <CheckCircleIcon color="success" /> : 
                          <UncheckedIcon />
                        }
                      </IconButton>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              sx={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? 'text.secondary' : 'text.primary'
                              }}
                            >
                              {task.text}
                            </Typography>
                            <Chip 
                              label={task.category} 
                              size="small" 
                              sx={{ ml: 1 }}
                            />
                            <Chip 
                              label={task.priority} 
                              size="small"
                              sx={{ 
                                ml: 1,
                                bgcolor: getPriorityColor(task.priority),
                                color: 'white'
                              }}
                            />
                          </Box>
                        }
                        secondary={format(new Date(task.dueDate), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                      />
                      <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>새로운 업무 추가</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="업무 내용"
              fullWidth
              value={newTaskData.text}
              onChange={(e) => setNewTaskData({ ...newTaskData, text: e.target.value })}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={newTaskData.category}
                onChange={(e) => setNewTaskData({ ...newTaskData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>우선순위</InputLabel>
              <Select
                value={newTaskData.priority}
                onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="마감일"
                value={newTaskData.dueDate}
                onChange={(date) => setNewTaskData({ ...newTaskData, dueDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>취소</Button>
            <Button onClick={handleAddTask} variant="contained">추가</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
