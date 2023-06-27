import React, { useState, forwardRef, useImperativeHandle} from 'react';
import { Keyboard, TouchableWithoutFeedback, Animated, Alert, 
  Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';

const Task = forwardRef(({ task, updateTask, completeTask, deleteTask }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');
  const [swipeAnim, setSwipeAnim] = useState(new Animated.Value(0));

  const saveChanges = () => {
    updateTask(task.id, name, description, task.completed);
    setIsEditing(false);
  };

  const markCompleted = () => {
    updateTask(task.id, task.name, task.description, true);
    completeTask(task.id); // Increment completeCount count
  };

  const handlePress = () => {
    if (!isSwiping) {
      setIsEditing(true);
    }
  };

  const handleSwipeLeftOpen = () => {
    setIsSwiping(true);
  };

  const handleSwipeLeftClose = () => {
    setIsSwiping(false);
  };

  useImperativeHandle(ref, () => ({
    handleSwipeLeftOpen,
    handleSwipeLeftClose
  }));

  const handleLongPress = () => {
    Alert.alert(
      "Delete task", // Alert title
      "Are you sure you want to delete this task?", // Alert message
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
        { 
          text: "OK", 
          onPress: () => deleteTask(task.id) 
        }
      ],
      { cancelable: false }
    );
  };

  const stylesTask = StyleSheet.create({
    completedTask: {
      backgroundColor: 'green',
      flex: 1,
      marginBottom: 8,
      paddingHorizontal: 20,
      paddingVertical: 30,
      borderRadius: 10,
  
      // initial values
      width: '100%',
      opacity: 0,
    },
  });  

  if (isEditing) {
    if(!isSwiping){
      return (
        <View style={styles.task}>
          <Text>Name:</Text>
          <TextInput value={name} onChangeText={setName} style={styles.editInput}/>
          <Text>Description:</Text>
          <TextInput value={description} onChangeText={setDescription} style={styles.editInput}/>
          <Button title="Save" onPress={saveChanges} />
        </View>
      );
    }
  }

  if (!isEditing){
    return (
      <SwipeRow
        leftOpenValue={400} // adjust this to match the amount you want to reveal
        //rightOpenValue={-50} // adjust this if you want right swipe too
        onRowOpen={markCompleted} // this will be called when row is swiped open
        swipeGestureBegan={() => setIsSwiping(true)}

        // use setScrollEnabled from SwipeRow

        swipeGestureEnded={() => setIsSwiping(false)}
        onSwipeValueChange={Animated.event(
          [{ value: swipeAnim }],
          { useNativeDriver: false }
        )}
      >
        <Animated.View 
          style={[
            stylesTask.completedTask,
            {
              transform: [
                {
                  scaleX: swipeAnim.interpolate({
                    inputRange: [0, 200],
                    outputRange: [0.9, 1.0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
              opacity: Animated.add(
                swipeAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0.0, 0.5],
                  extrapolate: 'clamp',
                }),
                swipeAnim.interpolate({
                  inputRange: [199, 210],
                  outputRange: [0.0, .5],
                  extrapolate: 'clamp',
                }),
              ),
            },
          ]}
        >
          <TouchableOpacity onLongPress={handleLongPress}>
            <Animated.Text style={[styles.actionText,
              {
                opacity: swipeAnim.interpolate({
                  inputRange: [0, 400],
                  outputRange: [1, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}>
              {task.completed ? task.name : 'Complete'}
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.task} onPress={handlePress} onLongPress={handleLongPress}>
          <Text>{task.name}</Text>
        </TouchableOpacity>
      </SwipeRow>
    );   
  }
});

function Taskbar({ tasks, updateTask, completeTask, deleteTask }) { // Add deleteTask prop
  return (
    <SwipeListView
      data={tasks}
      renderItem={({ item: task }) => (
        <Task key={task.id} task={task} updateTask={updateTask} completeTask={completeTask} deleteTask={deleteTask} />
      )}

      //scrollEnabled={false}
    />
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  const updateTask = (id, name, description) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, name, description } : task));
  };

  const completeTask = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: true } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };   

  const handleAddTask = () => {
    if (!showTextInput) {
      setShowTextInput(true);
      setAddingTask(true);
    } else {
      addTask();
    }
  };


  var completeCount = tasks.filter(task => task.completed).length;
  var percentageCompleted = completeCount / tasks.length * 100 || 0; 
  var blue = Math.round((100 - percentageCompleted) * 2.55);
  var green = Math.round((percentageCompleted) * 2.55);

  progressColorHexadecimal = `#00${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;

  const addTask = () => {
    if (newTaskName !== '') {
      setTasks([
        ...tasks,
        { 
          id: new Date().getTime(), // using timestamp as a unique id
          name: newTaskName,
          description: '', // or set a default description
          completed: false,
        }
      ]);
      setNewTaskName('');
      setAddingTask(false);
      setShowTextInput(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.taskCreation}>
          {showTextInput && (
            <TextInput
              value={newTaskName}
              onChangeText={setNewTaskName}
              placeholder="Enter new task name..."
              placeholderTextColor="white"
              style={[styles.textInput, { color: 'white' }]}
              onSubmitEditing={addTask}
              autoFocus={true}
            />
          )}
          <TouchableOpacity
            onPress={handleAddTask}
            onLongPress={() => setTasks([])}
            style={styles.buttonContainer}
          >
            <Text style={styles.buttonText}>
              {addingTask ? 'Add Task' : '+'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressAndColorContainer}>
          <View style={styles.progressContainer}>
            <AnimatedCircularProgress
              style={styles.progressRing}
              size={200}
              width={29}
              fill={percentageCompleted}
              tintColor={progressColorHexadecimal}
              backgroundColor="#ffffff"
              // increase background size
              backgroundWidth={17}
            >
              {(fill) => (
                <Text style={styles.progressText}>{(tasks.filter(task => task.completed).length / tasks.length * 100 || 0).toFixed(1)}%</Text>
              )}
            </AnimatedCircularProgress>
          </View>
          <View style={[styles.colorSquare, {backgroundColor: progressColorHexadecimal}]}/>
        </View>
        <Text style={styles.taskCountText}>Task Completion: {tasks.filter(task => task.completed).length} / {tasks.length}</Text>
        <View style={styles.taskbarContainer}>
          <Taskbar tasks={tasks} updateTask={updateTask} completeTask={completeTask} deleteTask={deleteTask} />
        </View>
      </GestureHandlerRootView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111111',
    flex: 1,
    padding: 15,
  },
  progressAndColorContainer: {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // add relative positioning here
  },
  colorSquare: {
    width: 24,
    height: 90,
    position: 'absolute', // add absolute positioning here
    right: 0, // adjust this value to position the square over the progress ring
    transform: [
      { rotate: '-45deg' },
      { skewY: '45deg' }, // Adjust the skew angle as desired
      { skewX: '0deg' },
    ],
    right: 73,
    top: 127,
  },
  progressRing: {
    // Additional styles can be applied if needed
    padding: 0, // Add this line to reduce the space
    transform: [{ rotate: '34deg' }], // Add this line to rotate the progress ring by 45 degrees
  },
  progressText: {
    fontSize: 32, // Double the font size
    transform: [{ rotate: '-34deg' }], // Add this line to rotate the progress ring by 45 degrees
    color: 'white',
    textAlign: 'center',
  },
  taskCreation: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Add this line
    marginTop: 50,
    marginBottom: 10,
  },  
  textInput: {
    flex: 1,
    height: 'auto',
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    marginBottom: 0,
  },
  editInput: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 10, 
  },
  task: {
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 10, // Add this line to round the edges
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  taskCountText: {
    fontSize: 18,
    marginTop: 10,
    color: 'white',
  },
  taskbarContainer: {
    flex: 1,
    maxHeight: '90%', // Adjust this value as needed
  },  
  buttonContainer: {
    backgroundColor: "#DDDDDD",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },  
});