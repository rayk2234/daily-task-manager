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
  Tab,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  CalendarToday as CalendarIcon,
  Dashboard as DashboardIcon,
  List as ListIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format, isToday, isFuture, isPast, startOfDay, subDays, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
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
  const [view, setView] = useState('list'); // 'list' or 'dashboard'
  const [recurringTasks, setRecurringTasks] = useState([]);

  const categories = ['업무', '개인', '회의', '기타'];
  const priorities = ['낮음', '보통', '높음'];

  // 반복 업무 패턴 타입
  const RECURRING_PATTERNS = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  };

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

  // 대시보드 데이터 계산 함수들
  const getCategoryStats = () => {
    const stats = {};
    tasks.forEach(task => {
      if (!stats[task.category]) {
        stats[task.category] = {
          name: task.category,
          total: 0,
          completed: 0
        };
      }
      stats[task.category].total += 1;
      if (task.completed) {
        stats[task.category].completed += 1;
      }
    });
    return Object.values(stats);
  };

  const getPriorityStats = () => {
    const stats = {};
    tasks.forEach(task => {
      if (!stats[task.priority]) {
        stats[task.priority] = {
          name: task.priority,
          value: 0
        };
      }
      stats[task.priority].value += 1;
    });
    return Object.values(stats);
  };

  const getCompletionTrend = () => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(date => {
      const dayTasks = tasks.filter(task => {
        const taskDate = startOfDay(new Date(task.dueDate));
        return taskDate.getTime() === startOfDay(date).getTime();
      });

      const completedTasks = dayTasks.filter(task => task.completed);
      const completionRate = dayTasks.length > 0 
        ? (completedTasks.length / dayTasks.length) * 100 
        : 0;

      return {
        date: format(date, 'MM/dd'),
        완료율: Math.round(completionRate)
      };
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              카테고리별 업무 현황
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCategoryStats()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="전체" fill="#8884d8" />
                <Bar dataKey="completed" name="완료" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              우선순위 분포
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPriorityStats()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPriorityStats().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              최근 7일간 완료율 추이
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getCompletionTrend()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="완료율" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 반복 업무 생성 함수
  const createRecurringTask = (task, pattern, endDate) => {
    const newRecurringTask = {
      ...task,
      id: Date.now(),
      isRecurring: true,
      pattern,
      endDate,
      lastGenerated: new Date()
    };
    setRecurringTasks([...recurringTasks, newRecurringTask]);
    return newRecurringTask;
  };

  // 반복 업무 자동 생성 함수
  const generateRecurringTasks = () => {
    const today = new Date();
    const newTasks = [];

    recurringTasks.forEach(recurringTask => {
      if (recurringTask.endDate && new Date(recurringTask.endDate) < today) {
        return; // 종료일이 지난 반복 업무는 건너뜀
      }

      const lastGenerated = new Date(recurringTask.lastGenerated);
      let shouldGenerate = false;

      switch (recurringTask.pattern) {
        case RECURRING_PATTERNS.DAILY:
          shouldGenerate = !isSameDay(lastGenerated, today);
          break;
        case RECURRING_PATTERNS.WEEKLY:
          shouldGenerate = !isSameDay(lastGenerated, today) && 
                          today.getDay() === new Date(recurringTask.dueDate).getDay();
          break;
        case RECURRING_PATTERNS.MONTHLY:
          shouldGenerate = !isSameDay(lastGenerated, today) && 
                          today.getDate() === new Date(recurringTask.dueDate).getDate();
          break;
      }

      if (shouldGenerate) {
        const newTask = {
          ...recurringTask,
          id: Date.now(),
          createdDate: today,
          dueDate: today,
          completed: false,
          isRecurring: false
        };
        newTasks.push(newTask);
        
        // 마지막 생성일 업데이트
        recurringTask.lastGenerated = today;
      }
    });

    if (newTasks.length > 0) {
      setTasks([...tasks, ...newTasks]);
    }
  };

  // 매일 자정에 반복 업무 생성
  useEffect(() => {
    const checkAndGenerateTasks = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        generateRecurringTasks();
      }
    };

    const interval = setInterval(checkAndGenerateTasks, 60000); // 1분마다 체크
    return () => clearInterval(interval);
  }, [recurringTasks]);

  // 반복 업무 추가 다이얼로그
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [recurringTaskData, setRecurringTaskData] = useState({
    text: '',
    category: '업무',
    dueDate: new Date(),
    priority: '보통',
    pattern: RECURRING_PATTERNS.DAILY,
    endDate: null
  });

  const handleAddRecurringTask = () => {
    if (recurringTaskData.text.trim()) {
      const newTask = {
        text: recurringTaskData.text,
        category: recurringTaskData.category,
        dueDate: recurringTaskData.dueDate,
        priority: recurringTaskData.priority
      };
      createRecurringTask(newTask, recurringTaskData.pattern, recurringTaskData.endDate);
      setRecurringTaskData({
        text: '',
        category: '업무',
        dueDate: new Date(),
        priority: '보통',
        pattern: RECURRING_PATTERNS.DAILY,
        endDate: null
      });
      setRecurringDialogOpen(false);
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
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(e, newView) => newView && setView(newView)}
              sx={{ mr: 2, bgcolor: 'white' }}
            >
              <ToggleButton value="list">
                <ListIcon />
              </ToggleButton>
              <ToggleButton value="dashboard">
                <DashboardIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton color="inherit" onClick={() => setOpenDialog(true)}>
              <AddIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => setRecurringDialogOpen(true)}>
              <CalendarIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4 }}>
          {view === 'list' ? (
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
          ) : (
            renderDashboard()
          )}
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

        {/* 반복 업무 추가 다이얼로그 */}
        <Dialog open={recurringDialogOpen} onClose={() => setRecurringDialogOpen(false)}>
          <DialogTitle>반복 업무 추가</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="업무 내용"
              fullWidth
              value={recurringTaskData.text}
              onChange={(e) => setRecurringTaskData({ ...recurringTaskData, text: e.target.value })}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={recurringTaskData.category}
                onChange={(e) => setRecurringTaskData({ ...recurringTaskData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>우선순위</InputLabel>
              <Select
                value={recurringTaskData.priority}
                onChange={(e) => setRecurringTaskData({ ...recurringTaskData, priority: e.target.value })}
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>반복 패턴</InputLabel>
              <Select
                value={recurringTaskData.pattern}
                onChange={(e) => setRecurringTaskData({ ...recurringTaskData, pattern: e.target.value })}
              >
                <MenuItem value={RECURRING_PATTERNS.DAILY}>매일</MenuItem>
                <MenuItem value={RECURRING_PATTERNS.WEEKLY}>매주</MenuItem>
                <MenuItem value={RECURRING_PATTERNS.MONTHLY}>매월</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="시작일"
                value={recurringTaskData.dueDate}
                onChange={(date) => setRecurringTaskData({ ...recurringTaskData, dueDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="종료일 (선택사항)"
                value={recurringTaskData.endDate}
                onChange={(date) => setRecurringTaskData({ ...recurringTaskData, endDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRecurringDialogOpen(false)}>취소</Button>
            <Button onClick={handleAddRecurringTask} variant="contained">추가</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
